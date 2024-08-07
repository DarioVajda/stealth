import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import Send from './components/Send';
import Scan from './components/Scan';

function App() {
  return (
    <BrowserRouter>
      {/* Your application code goes here */}
      <Routes>
        <Route exact path="/" component={<Home/>} />
        <Route path="/send" component={<Send/>} />
        <Route path="/scan" component={<Scan/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
