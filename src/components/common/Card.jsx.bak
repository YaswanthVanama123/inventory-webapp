import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  padding = 'normal',
  hover = false,
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    normal: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const baseStyles = 'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-shadow duration-200';
  const hoverStyles = hover ? 'hover:shadow-lg cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {(title || headerAction) && (
        <div className={`border-b border-gray-200 dark:border-gray-700 ${paddingStyles[padding]} flex items-center justify-between`}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="ml-4">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-gray-200 dark:border-gray-700 ${paddingStyles[padding]} bg-gray-50 dark:bg-gray-900/50 rounded-b-lg`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  headerAction: PropTypes.node,
  footer: PropTypes.node,
  padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg']),
  hover: PropTypes.bool,
  className: PropTypes.string,
};

export default Card;
