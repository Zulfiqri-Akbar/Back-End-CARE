const { Firestore } = require('@google-cloud/firestore');

async function storeData(id, data, modelType) {
  const db = new Firestore();

  let collectionName;
  if (modelType === 'autism') {
    collectionName = 'autism_predictions';
  } else if (modelType === 'emotion') {
    collectionName = 'emotion_predictions';
  } else {
    throw new Error('Invalid model type');
  }

  const predictCollection = db.collection(collectionName);
  return predictCollection.doc(id).set(data);
}

module.exports = storeData;
