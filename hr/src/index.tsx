import React from 'react';
import ReactDOM from 'react-dom';
import {App} from "./components/App";
import './index.css';
import {prepareData} from "./data";

prepareData();

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);


