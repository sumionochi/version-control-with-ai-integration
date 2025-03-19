'use client';

import * as React from 'react';
import { Loader, LoaderType } from '@progress/kendo-react-indicators';

interface LoadingStateProps {
    type?: LoaderType;
    size?: 'small' | 'medium' | 'large';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
    type = 'infinite-spinner',
    size = "medium"
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <Loader type={type} size={size} />
        </div>
    );
};

export default LoadingState;