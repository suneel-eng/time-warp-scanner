import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Modal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Info = styled.h1`
    color: grey;
`;

const VideoEl = styled.div`
    width: 100%;
    height: 100vh;
    position: absolute;
    background-color: white;
    z-index: 1;
`;

const CanvasEl = styled(VideoEl)`
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
`;

const ButtonGroup = styled(CanvasEl)`
    z-index: 3;
    width: 100%;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const Button = styled.button`
  padding: 10px;
  border: 1px solid grey;
  color: grey;
  font-weight: bold;
  background-color: white;
  width: 100px;
  cursor: pointer;
`;

const InfoEl = styled(VideoEl)`
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
`;

type ScannerProps = {
    onClose: () => void;
    scanningType: "horizontal" | "vertical";
}

export default function Scanner({ onClose, scanningType }: ScannerProps) {

    const [ cameraPermitted, setCameraPermitted ] = useState<boolean>(false);
    const [ scanningComplete, setScanningComplete ] = useState<boolean>(false);

    const mediaStreamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationRef = useRef<number | null>(null);
    const scanningLinePositionRef = useRef<number>(0);
    const downloadImageRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        accessCamera();

        return () => {};
    }, []);

    useEffect(() => {
        if(cameraPermitted && videoRef.current && canvasRef.current) {
            videoRef.current.onloadedmetadata = playVideo;
            videoRef.current.srcObject = mediaStreamRef.current;
        }
    }, [ cameraPermitted ]);

    const accessCamera = async () => {
        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
            setCameraPermitted(true);
        } catch(err) {
            onClose();
        }
    }

    const playVideo = () => {
        if(videoRef.current) {
            videoRef.current.play();
            updateCanvasSize();
        }
    }

    const updateCanvasSize = () => {
        if(videoRef.current && canvasRef.current) {
            const domRect: DOMRect = videoRef.current.getBoundingClientRect();
            canvasRef.current.width = domRect.width;
            canvasRef.current.height = domRect.height;
            console.log(domRect.width, domRect.height);
            contextRef.current = canvasRef.current.getContext("2d");
            paintVideoOnCanvas();
        }
    }

    const paintVideoOnCanvas = () => {
        let context = contextRef.current;
        if(context && canvasRef.current && videoRef.current) {
            const { width, height } = canvasRef.current;

            if(
                (scanningLinePositionRef.current > width && scanningType === "horizontal") ||
                (scanningLinePositionRef.current > height && scanningType === "vertical")
            ) {
                if(animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
        
                if(mediaStreamRef.current) {
                    mediaStreamRef.current.getVideoTracks()[0].stop();
                }
        
                if(videoRef.current) {
                    videoRef.current.srcObject = null;
                }
                setScanningComplete(true);
            }

            if(scanningType === "horizontal") {
                context.clearRect(scanningLinePositionRef.current - 1, 0, width, height);

                /**
                * 
                * draw current frame of video
                *
                * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
                * 
                */
                context.drawImage(
                    videoRef.current,
                    scanningLinePositionRef.current,
                    0,
                    width - scanningLinePositionRef.current,
                    height,
                    scanningLinePositionRef.current - 2,
                    0,
                    width - scanningLinePositionRef.current,
                    height
                );

                // draw scanning line
            context.beginPath();
            context.moveTo(scanningLinePositionRef.current, 0);
            context.lineTo(scanningLinePositionRef.current, height);
            context.lineWidth = 1;
            context.stroke();
            context.closePath();
            } else if(scanningType === "vertical") {
                context.clearRect(0, scanningLinePositionRef.current - 1, width, height);
                context.drawImage(
                    videoRef.current,
                    0,
                    scanningLinePositionRef.current,
                    width,
                    height - scanningLinePositionRef.current,
                    0,
                    scanningLinePositionRef.current - 2,
                    width,
                    height - scanningLinePositionRef.current
                );

                // draw scanning line
                context.beginPath();
                context.moveTo(0, scanningLinePositionRef.current);
                context.lineTo(width, scanningLinePositionRef.current);
                context.lineWidth = 1;
                context.stroke();
                context.closePath();
            }

            // increase the position of scanning line
            scanningLinePositionRef.current += 1;
        }

        animationRef.current = requestAnimationFrame(paintVideoOnCanvas);
    }

    const downloadCanvasAsImage = () => {
        if(canvasRef.current) {
            const dataURL = canvasRef.current.toDataURL();
            if(downloadImageRef.current) {
                downloadImageRef.current.href = dataURL;
                downloadImageRef.current.download = "time-warp-scan.png";
                downloadImageRef.current.click();
                onClose();
            }
        }
    }

    console.log("Scanner rendered")
    return <Modal>
        <VideoEl>
            <video disablePictureInPicture ref={videoRef}></video>
        </VideoEl>
        <CanvasEl>
            <canvas ref={canvasRef}></canvas>
        </CanvasEl>
       { scanningComplete &&  <ButtonGroup>
            <Button onClick={() => downloadCanvasAsImage()}>Download Image</Button>
            <a ref={downloadImageRef} style={{ display: "none" }}></a>
            <Button onClick={() => onClose()}>Try New Scanning</Button>
        </ButtonGroup>}
        { !cameraPermitted && <InfoEl>
            <Info>Click "Allow" to access camera</Info>
        </InfoEl>}
    </Modal>
}