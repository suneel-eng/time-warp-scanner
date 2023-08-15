import React, { useState } from 'react';
import styled from 'styled-components';
import Scanner from './Scanner';

const Header = styled.header`
  padding: 20px;
`;

const Heading = styled.h1`
  color: grey;
  text-align: center;
`;

const Container = styled.div`
  max-width: 300px;
  width: 100%;
  margin: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const FormControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  align-self: start;
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

function App(): JSX.Element {
  const [ scanningType, setScanningType ] = useState<"horizontal" | "vertical" >("horizontal");
  const [ showScannig, setShowScanning ] = useState<boolean>(false);

  const enableHorizontalScanning = () => {
    setScanningType("horizontal");
  }

  const enableVerticalScanning = () => {
    setScanningType("vertical");
  }

  const startScanning = async () => {
    setShowScanning(true);
  }

  return (
    <div>
      <Header>
        <Heading>TIME WARP SCANNER</Heading>
      </Header>
      <Container>
        <FormControl>
          <input type="radio" checked={scanningType === "horizontal"} name="scanningType" id="horizontal" onChange={() => enableHorizontalScanning()} />
          <label htmlFor='horizontal'>Horizontal Scanning</label>
        </FormControl>
        <FormControl>
          <input type="radio" checked={scanningType === "vertical"} name="scanningType" id="vertical" onChange={() => enableVerticalScanning()} />
          <label htmlFor='vertical'>Vertical Scanning</label>
        </FormControl>
        <Button onClick={() => startScanning()}>Start</Button>
      </Container>
      { showScannig && <Scanner scanningType={scanningType} onClose={() => setShowScanning(false) }/>}
    </div>
  );
}

export default App;
