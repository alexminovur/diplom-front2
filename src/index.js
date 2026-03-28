import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Тема в коричневых тонах
const theme = extendTheme({
    colors: {
        brand: {
            50: '#fdf4eb',
            100: '#f9dcc3',
            200: '#f3c09a',
            300: '#ec9d72',
            400: '#e67d4f',
            500: '#cc5a2a',
            600: '#b34a22',
            700: '#993a1a',
            800: '#802c12',
            900: '#66200c',
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>
);
