import argparse
from sys import platform

from models import * 
from utils.datasets import *
from utils.utils import *

parser = argparse.ArgumentParser()
parser.add_argument('--cfg', type=str, default='/content/datasetMaskVictor/yolov3-mask-spp.cfg', help='*.cfg path')
parser.add_argument('--names', type=str, default='/content/datasetMaskVictor/obj.names', help='*.names path')
parser.add_argument('--weights', type=str, default='/content/yolov3/weights/mask_best_victor.pt', help='weights path')
parser.add_argument('--img-size', type=int, default=320, help='inference size (pixels)')
parser.add_argument('--conf-thres', type=float, default=0.1, help='object confidence threshold')
parser.add_argument('--iou-thres', type=float, default=0.6, help='IOU threshold for NMS')
parser.add_argument('--classes', nargs='+', type=int, help='filter by class')
parser.add_argument('--agnostic-nms', action='store_true', help='class-agnostic NMS')
opt = parser.parse_args(args = [])

# Initialize
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'

# Initialize model
model = Darknet(opt.cfg, opt.img_size)

# Load weights
attempt_download(opt.weights)
if opt.weights.endswith('.pt'):  # pytorch format
    model.load_state_dict(torch.load(opt.weights, map_location=device)['model'])
else:  # darknet format
    load_darknet_weights(model, opt.weights)

model.to(device).eval()

# Get names and colors
names = load_classes(opt.names)
random.seed(1)
colors = [[random.randint(0, 255) for _ in range(3)] for _ in range(len(names))]


def js_reply_to_image(js_reply):
    """
    input: 
          js_reply: JavaScript object, contain image from webcam

    output: 
          image_array: image array RGB size 512 x 512 from webcam
    """
    jpeg_bytes = base64.b64decode(js_reply['img'].split(',')[1])
    image_PIL = Image.open(io.BytesIO(jpeg_bytes))
    image_array = np.array(image_PIL)

    return image_array

def get_drawing_array(image_array): 
    """
    input: 
          image_array: image array RGB size 512 x 512 from webcam

    output: 
          drawing_array: image RGBA size 512 x 512 only contain bounding box and text, 
                              channel A value = 255 if the pixel contains drawing properties (lines, text) 
                              else channel A value = 0
    """
    drawing_array = np.zeros([512,512,4], dtype=np.uint8)
    img = letterbox(image_array, new_shape=opt.img_size)[0]

    img = img.transpose(2, 0, 1)
    img = np.ascontiguousarray(img)

    img = torch.from_numpy(img).to(device)
    img = img.float()  # uint8 to fp16/32
    img /= 255.0  # (0 - 255) to (0.0 - 1.0)
    if img.ndimension() == 3:
        img = img.unsqueeze(0)
    pred = model(img)[0]

    # Apply NMS
    pred = non_max_suppression(pred, opt.conf_thres, opt.iou_thres, classes=opt.classes, agnostic=opt.agnostic_nms)

    # Process detections
    det = pred[0]
    
    if det is not None and len(det):
        det[:, :4] = scale_coords(img.shape[2:], det[:, :4], image_array.shape).round()
        
        # Write results
        for *xyxy, conf, cls in det:
            label = '%s %.2f' % (names[int(cls)], conf)
            plot_one_box(xyxy, drawing_array, label=label, color=colors[int(cls)])

    drawing_array[:,:,3] = (drawing_array.max(axis = 2) > 0 ).astype(int) * 255

    return drawing_array

def drawing_array_to_bytes(drawing_array):
    """
    input: 
          drawing_array: image RGBA size 512 x 512 
                              contain bounding box and text from yolo prediction, 
                              channel A value = 255 if the pixel contains drawing properties (lines, text) 
                              else channel A value = 0

    output: 
          drawing_bytes: string, encoded from drawing_array
    """

    drawing_PIL = Image.fromarray(drawing_array, 'RGBA')
    iobuf = io.BytesIO()
    drawing_PIL.save(iobuf, format='png')
    drawing_bytes = 'data:image/png;base64,{}'.format((str(base64.b64encode(iobuf.getvalue()), 'utf-8')))
    return drawing_bytes