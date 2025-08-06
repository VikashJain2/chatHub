export const generateECDHKeys = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    true,
    ["deriveKey"]
  );

  const publicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const privateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  };
};

export const deriveSharedSecret = async (privateKey, publicKey) => {
  const importedPrivateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(privateKey),
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    false,
    ["deriveKey"]
  );

  const importedPublicKey = await window.crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(publicKey),
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    false,
    []
  );
  return window.crypto.subtle.deriveKey(
    { name: "ECDH", public: importedPublicKey },
    importedPrivateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptMessage = async (message, sharedKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);
  const cipherText = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    sharedKey,
    encoded
  );

  return {
    cipherText: arrayBufferToBase64(cipherText),
    iv: arrayBufferToBase64(iv),
  };
};

export const decryptMessage = async (cipherText, iv, sharedKey) => {
  const decryptMessage = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToArrayBuffer(iv),
    },
    sharedKey,
    base64ToArrayBuffer(cipherText)
  );

  return new TextDecoder().decode(decryptMessage);
};

export const encryptPrivateKey = async (privateKey, password) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    base64ToArrayBuffer(privateKey)
  );

  return {
    encryptedPrivateKey: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  };
};

export const decryptPrivateKey = async (
  encryptedPrivateKey,
  ivBase64,
  saltBase64,
  password
) => {
  const salt = base64ToArrayBuffer(saltBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    base64ToArrayBuffer(encryptedPrivateKey)
  );
  return arrayBufferToBase64(decrypted)
};
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
};

const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
