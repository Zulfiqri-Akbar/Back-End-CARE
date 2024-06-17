const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassificationAutism(model, image) {
    try {
        // Decode JPEG image, resize, expand dimensions, and convert to float tensor
        const tensor = tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat();
        
        // Normalize pixel values to [0, 1] range (assuming image data is in [0, 255])
        const normalizedTensor = tensor.div(tf.scalar(255));
        
        // Predict with the model
        const prediction = model.predict(normalizedTensor);
        
        // Extract probabilities from prediction
        const probabilities = await prediction.data();
        
        // Determine class label based on probabilities
        const classes = ['autistic', 'non_autistic']; // Adjust class names based on your model
        const predictedClassIndex = probabilities[0] <= 0.5 ? 0 : 1; // Adjust threshold as needed
        console.log(`Probabilities: ${probabilities[0]}`);
        const label = classes[predictedClassIndex];
        
        return { label };
    } catch (error) {
        throw new InputError(`Prediction error: ${error.message}`);
    }
}

module.exports = predictClassificationAutism;
