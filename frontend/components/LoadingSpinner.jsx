import React from 'react';

function LoadingSpinner(props) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <div
                className="animate-spin text-theme-blue rounded-full h-32 w-32 border-t-2 border-b-2 border-theme-blue"></div>
        </div>
    );
}

export default LoadingSpinner;