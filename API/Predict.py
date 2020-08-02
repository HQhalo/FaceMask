
import argparse
from sys import platform

from models import * 
from utils.datasets import *
from utils.utils import *

device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
class Predict:
    def __init__(self,cfg = "/content/datasetMaskVictor/yolov3-mask-spp.cfg"
                ,names = '/content/datasetMaskVictor/obj.names'
                ,weights     = '/content/yolov3/weights/mask_best_victor.pt'
                ,imgSize    = 320
                ,confThres  = 0.1
                ,iouThres   = 0.6):
        self.imgSize = imgSize
        self.confThres = confThres
        self.iouThres = iouThres
        #Initialize model
        self.model = Darknet(cfg, imgSize)
        
        #load Weights
        if weights.endswith('.pt'):  # pytorch format
            self.model.load_state_dict(torch.load(weights, map_location=device)['model'])
        else:  # darknet format
            load_darknet_weights(self.model, weights)
        self.model.to(device).eval()

        #load label 
        self.names = load_classes(names)
        random.seed(1)
        self.colors = [[random.randint(0, 255) for _ in range(3)] for _ in range(len(self.names))]
    
    def get_predict(self,image):
        drawing_array = np.zeros([512,512,4], dtype=np.uint8)
        img = letterbox(image, new_shape=self.imgSize)[0]
        img = img.transpose(2, 0, 1)
        img = np.ascontiguousarray(img)

        img = torch.from_numpy(img).to(device)
        img = img.float()  # uint8 to fp16/32
        img /= 255.0  # (0 - 255) to (0.0 - 1.0)
        if img.ndimension() == 3:
            img = img.unsqueeze(0)
        
        pred = self.model(img)[0]
        
        pred = non_max_suppression(pred, self.confThres, self.iouThres)
        det = pred[0]

        rel = []

        if det is not None and len(det):
            det[:, :4] = scale_coords(img.shape[2:], det[:, :4], image.shape).round()
            
            # Write results
            for *xyxy, conf, cls in det:
                temp = {'boxes': xyxy}
                temp["label"] = self.names[int(cls)]
                temp['color'] = self.colors[int(cls)]
                temp['confidence'] = conf
                rel.append(temp)
                # label = '%s %.2f' % (self.names[int(cls)], conf)
                # plot_one_box(xyxy, drawing_array, label=label, color=colors[int(cls)])
        return json.dumps(rel)
        

        