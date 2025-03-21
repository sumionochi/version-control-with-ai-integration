import React from 'react';
import { SVGIcon } from '@progress/kendo-react-common';

interface StepperItemProps {
  label: React.ReactNode;
  icon?: React.ReactNode | string;
  isActive?: boolean;
  isLast?: boolean;
}

interface CustomStepperProps {
  items: StepperItemProps[];
  activeStep: number;
  onStepClick?: (index: number) => void;
}

const StepperItem: React.FC<StepperItemProps> = ({ label, icon, isActive, isLast }) => {
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
          ${isActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-white'}`}>
          {typeof icon === 'string' ? (
            <img src={icon} alt="" className="w-4 h-4" />
          ) : (
            icon
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-full min-h-[2rem] mt-2 
            ${isActive ? 'bg-orange-500' : 'bg-gray-300'}`} />
        )}
      </div>
      <div className="ml-4 -mt-1">
        <div className={`${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
          {label}
        </div>
      </div>
    </div>
  );
};

const CustomStepper: React.FC<CustomStepperProps> = ({ 
  items, 
  activeStep, 
  onStepClick 
}) => {
  return (
    <div className="flex flex-col space-y-0">
      {items.map((item, index) => (
        <div 
          key={index}
          onClick={() => onStepClick?.(index)}
          className="cursor-pointer"
        >
          <StepperItem
            {...item}
            isActive={index === activeStep}
            isLast={index === items.length - 1}
          />
        </div>
      ))}
    </div>
  );
};

export default CustomStepper;