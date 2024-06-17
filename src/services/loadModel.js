const tf = require('@tensorflow/tfjs-node');

// Define the L2 regularizer function
function L2(config) {
  return tf.regularizers.l2({
    l2: config.l2,  
  });
}

// Define the className property for the custom regularizer
L2.className = 'L2';

// Register the custom regularizer class with tf.serialization
tf.serialization.registerClass(L2);

async function loadModel(modelUrl) {
  const customObjects = { L2 };

  try {
    const model = await tf.loadLayersModel(modelUrl, { customObjects });
    console.log(`Model loaded successfully from ${modelUrl}`);
    return model;
  } catch (error) {
    console.error(`Error loading model from ${modelUrl}:`, error);
    throw error;
  }
}

async function loadModels() {
  const modelUrl1 = process.env.MODEL_URL_1;
  const modelUrl2 = process.env.MODEL_URL_2;

  try {
    const model1 = await loadModel(modelUrl1);
    const model2 = await loadModel(modelUrl2);
    return { model1, model2 };
  } catch (error) {
    console.error('Error loading models:', error);
    throw error;
  }
}

module.exports = { loadModel, loadModels };
