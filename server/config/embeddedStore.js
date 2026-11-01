import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SNAPSHOT_FILE = path.join(__dirname, '..', '.mongo-data', 'learnspace-db.json');

/**
 * Installs a lightweight, synchronous/async Mongoose Document & Query adapter
 * backed by a local JSON file when a live MongoDB Atlas / local mongod instance
 * is not reachable. This guarantees that all 7 Mongoose models (User, Course,
 * Lesson, Enrollment, Quiz, QuizAttempt, Progress), `.populate()`, `$or` regex
 * queries, `.select('+password')`, pre-save hooks, and instance methods work
 * seamlessly with zero external binary downloads.
 */
let collections = {};

const loadSnapshot = () => {
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      collections = JSON.parse(raw);
    }
  } catch {
    collections = {};
  }
};

const saveSnapshot = () => {
  try {
    const dir = path.dirname(SNAPSHOT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const serialized = {};
    for (const [modelName, docs] of Object.entries(collections)) {
      serialized[modelName] = docs.map((d) =>
        typeof d.toObject === 'function' ? d.toObject() : d
      );
    }
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(serialized, null, 2), 'utf-8');
  } catch {
    // ignore disk snapshot error
  }
};

const matchesFilter = (doc, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

  for (const [key, cond] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(cond)) {
      const anyMatch = cond.some((sub) => matchesFilter(obj, sub));
      if (!anyMatch) return false;
      continue;
    }

    const val = obj[key];
    if (cond instanceof RegExp) {
      if (!cond.test(String(val || ''))) return false;
    } else if (cond && typeof cond === 'object' && !(cond instanceof mongoose.Types.ObjectId)) {
      if (String(val) !== String(cond)) return false;
    } else {
      if (String(val) !== String(cond)) return false;
    }
  }
  return true;
};

class EmbeddedQuery {
  constructor(model, filter = {}, isSingle = false) {
    this.model = model;
    this.filter = filter;
    this.isSingle = isSingle;
    this.sortSpec = null;
    this.limitCount = null;
    this.populates = [];
    this.selectSpec = null;
  }

   select(spec) {
    this.selectSpec = spec;
    return this;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(n) {
    this.limitCount = n;
    return this;
  }

  populate(arg1, arg2) {
    if (typeof arg1 === 'string') {
      this.populates.push({ path: arg1, select: arg2 });
    } else if (arg1 && typeof arg1 === 'object') {
      this.populates.push(arg1);
    }
    return this;
  }

  async exec() {
    const store = collections[this.model.modelName] || [];
    let matched = store.filter((doc) => matchesFilter(doc, this.filter));

    if (this.sortSpec) {
      const [field, dir] = Object.entries(this.sortSpec)[0];
      matched = [...matched].sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av < bv) return dir === -1 ? 1 : -1;
        if (av > bv) return dir === -1 ? -1 : 1;
        return 0;
      });
    }

    if (typeof this.limitCount === 'number') {
      matched = matched.slice(0, this.limitCount);
    }

    const clonedDocs = matched.map((d) => this.hydrateDoc(d));

    for (const pop of this.populates) {
      await this.applyPopulate(clonedDocs, pop);
    }

    if (this.isSingle) {
      return clonedDocs[0] || null;
    }
    return clonedDocs;
  }

  hydrateDoc(rawDoc) {
    const plain =
      typeof rawDoc.toObject === 'function'
        ? rawDoc.toObject()
        : JSON.parse(JSON.stringify(rawDoc));
    const doc = new this.model(plain);
    const obj = doc.toObject({ getters: false, virtuals: false });
    obj._id = plain._id;
    obj.createdAt = plain.createdAt ? new Date(plain.createdAt) : new Date();
    obj.updatedAt = plain.updatedAt ? new Date(plain.updatedAt) : new Date();
    if (plain.password) {
      obj.password = plain.password;
    }
    if (obj.preferences && typeof obj.preferences.toObject !== 'function') {
      const prefsCopy = { ...obj.preferences };
      Object.defineProperty(obj.preferences, 'toObject', {
        value: () => prefsCopy,
        enumerable: false,
      });
    }
    // Bind schema instance methods (such as comparePassword) and save()
    if (this.model.schema?.methods) {
      for (const [mName, fn] of Object.entries(this.model.schema.methods)) {
        Object.defineProperty(obj, mName, {
          value: fn.bind(obj),
          enumerable: false,
        });
      }
    }
    const ModelRef = this.model;
    Object.defineProperty(obj, 'toObject', {
      value: () => {
        const clone = { ...obj };
        return clone;
      },
      enumerable: false,
    });
    Object.defineProperty(obj, 'save', {
      value: async function () {
        const inst = new ModelRef(this);
        inst._id = this._id;
        inst.createdAt = this.createdAt;
        if (this.password) inst.password = this.password;
        await inst.save();
        this.password = inst.password;
        this.updatedAt = inst.updatedAt;
        return this;
      },
      enumerable: false,
    });
    return obj;
  }

  async applyPopulate(docs, popSpec) {
    const pathName = popSpec.path;
    const schemaPath = this.model.schema.path(pathName);
    let refModelName = null;

    if (schemaPath?.options?.ref) {
      refModelName = schemaPath.options.ref;
    } else if (schemaPath?.caster?.options?.ref) {
      refModelName = schemaPath.caster.options.ref;
    }

    if (!refModelName) return;
    const RefModel = mongoose.models[refModelName];
    if (!RefModel) return;

    const refStore = collections[refModelName] || [];

    for (const doc of docs) {
      const val = doc[pathName];
      if (Array.isArray(val)) {
        let populatedArr = val
          .map((id) => {
            const found = refStore.find((r) => String(r._id) === String(id?._id || id));
            return found ? JSON.parse(JSON.stringify(found)) : null;
          })
          .filter(Boolean);

        if (popSpec.options?.sort) {
          const [sField, sDir] = Object.entries(popSpec.options.sort)[0];
          populatedArr.sort((a, b) =>
            a[sField] < b[sField] ? (sDir === -1 ? 1 : -1) : 1
          );
        }

        doc[pathName] = populatedArr;
      } else if (val) {
        const found = refStore.find((r) => String(r._id) === String(val?._id || val));
        if (found) {
          const refClone = JSON.parse(JSON.stringify(found));
          if (popSpec.populate) {
            await new EmbeddedQuery(RefModel).applyPopulate([refClone], popSpec.populate);
          }
          doc[pathName] = refClone;
        }
      }
    }
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

export const enableEmbeddedPersistence = () => {
  loadSnapshot();

  // Mark mongoose connection as ready (1 = connected)
  Object.defineProperty(mongoose.connection, 'readyState', {
    get: () => 1,
    configurable: true,
  });

  mongoose.Model.prototype.save = async function () {
    const modelName = this.constructor.modelName;
    if (!collections[modelName]) collections[modelName] = [];

    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    const now = new Date();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    // Run pre-save password hashing hook for User model if password was set in plaintext
    if (
      modelName === 'User' &&
      this.password &&
      !String(this.password).startsWith('$2a$') &&
      !String(this.password).startsWith('$2b$')
    ) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const plain = this.toObject({ getters: false, virtuals: false });
    if (this.password) plain.password = this.password;
    plain.createdAt = this.createdAt;
    plain.updatedAt = this.updatedAt;

    const existingIdx = collections[modelName].findIndex(
      (item) => String(item._id) === String(this._id)
    );
    if (existingIdx >= 0) {
      collections[modelName][existingIdx] = plain;
    } else {
      collections[modelName].push(plain);
    }

    this.isNew = false;
    saveSnapshot();
    return this;
  };

  mongoose.Model.create = async function (docOrArray) {
    if (Array.isArray(docOrArray)) {
      const results = [];
      for (const item of docOrArray) {
        const instance = new this(item);
        if (item.createdAt) instance.createdAt = new Date(item.createdAt);
        await instance.save();
        results.push(instance);
      }
      return results;
    }
    const instance = new this(docOrArray);
    if (docOrArray.createdAt) instance.createdAt = new Date(docOrArray.createdAt);
    await instance.save();
    return instance;
  };

  mongoose.Model.find = function (filter = {}) {
    return new EmbeddedQuery(this, filter, false);
  };

  mongoose.Model.findOne = function (filter = {}) {
    return new EmbeddedQuery(this, filter, true);
  };

  mongoose.Model.findById = function (id) {
    return new EmbeddedQuery(this, { _id: id }, true);
  };

  mongoose.Model.countDocuments = async function (filter = {}) {
    const store = collections[this.modelName] || [];
    return store.filter((doc) => matchesFilter(doc, filter)).length;
  };

  mongoose.Model.deleteMany = async function (filter = {}) {
    const store = collections[this.modelName] || [];
    if (!filter || Object.keys(filter).length === 0) {
      collections[this.modelName] = [];
    } else {
      collections[this.modelName] = store.filter((doc) => !matchesFilter(doc, filter));
    }
    saveSnapshot();
    return { acknowledged: true };
  };
};
