// lib/policyStore.js
let POLICY_CHUNKS = []; // { id, text, embedding, idx }
let POLICY_VERSION = null;

export function setPolicy(chunks, version) {
  POLICY_CHUNKS = chunks;
  POLICY_VERSION = version;
}

export function getPolicyChunks() {
  return POLICY_CHUNKS;
}

export function getPolicyVersion() {
  return POLICY_VERSION;
}
