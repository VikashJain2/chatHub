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
