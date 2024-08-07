import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import Home from './components/Home';
import Send from './components/Send';
import Scan from './components/Scan';

function App() {

  const [ signature, setSignature ] = useState(null);

  return (
    <BrowserRouter>
      {/* Your application code goes here */}
      <Routes>
        <Route exact path="/" component={<Home signature={signature} setSignature={setSignature} />} />
        <Route path="/send" component={<Send signature={signature} setSignature={setSignature} />} />
        <Route path="/scan" component={<Scan signature={signature} setSignature={setSignature} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
