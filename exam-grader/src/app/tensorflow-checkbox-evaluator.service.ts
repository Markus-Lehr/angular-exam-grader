import {Injectable} from '@angular/core';
import * as tmImage from '@teachablemachine/image'

@Injectable({
  providedIn: 'root'
})
export class TensorflowCheckboxEvaluatorService {
  url = 'https://teachablemachine.withgoogle.com/models/iXG3cCLQQ/';
  model;
  maxPredictions;

  constructor() {
  }

  public async initialize() {
    const modelURL = this.url + "model.json";
    const metadataURL = this.url + "metadata.json";

    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    console.log('starting tf-image load');
    this.model = await tmImage.load(modelURL, metadataURL);
    console.log('loaded tf-image');
    this.maxPredictions = this.model.getTotalClasses();
  }

  // run the canvas image through the image model
  public async predict(canvas: HTMLCanvasElement): Promise<number> {
    // predict can take in an image, video or canvas html element
    const prediction = await this.model.predict(canvas);
    for (let i = 0; i < this.maxPredictions; i++) {
      const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      console.log(classPrediction);
      if (prediction[i].className === 'marked') {
        return prediction[i].probability;
      }
    }
    return 0;
  }
}
