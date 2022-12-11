import React from 'react';
import { render } from 'react-dom';

import Record from './Record';
import './index.css';

render(<Record />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
