const { Firestore } = require('@google-cloud/firestore');

async function getHistoriesEmotion() {
  const db = new Firestore();
 
  return new Promise((resolve, reject) => {
      db.collection('emotion_predictions').get()
        .then(snapshot => {
          const data = [];
          snapshot.forEach(doc => {
            data.push({ id: doc.id, history: { ...doc.data() } });
          });
          resolve(data);
        })
        .catch(error => {
          console.error('Error getting histories: ', error);
          reject(error);
        });
    });
}
 
module.exports = getHistoriesEmotion;