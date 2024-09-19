import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { SelectableValue } from '@grafana/data';
import { Menu, MenuItem, ToolbarButton, useTheme2 } from '@grafana/ui';
import { FocusScope } from '@react-aria/focus';
import React, { HTMLAttributes, useState } from 'react';

import { TEST_IDS } from '@/constants';

import { getStyles } from './ButtonSelect.styles';

/**
 * Toolbar Button Variant
 */
type ToolbarButtonVariant = 'default' | 'primary' | 'destructive' | 'active' | 'canvas';

/**
 * Properties
 */
interface Props<T> extends HTMLAttributes<HTMLButtonElement> {
  className?: string;

  options: Array<SelectableValue<T>>;

  value?: SelectableValue<T>;
  onChange: (item: SelectableValue<T>) => void;
  narrow?: boolean;
  variant?: ToolbarButtonVariant;
  tooltip?: string;
}

export const ButtonSelect = <T,>(props: Props<T>) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  const { className, options, value, onChange, narrow, variant, ...restProps } = props;
  const [isOpen, setIsOpen] = useState(false);

  /**
   * The order of middleware is important!
   */
  const middleware = [
    offset(0),
    flip({
      fallbackAxisSideDirection: 'end',
      // see https://floating-ui.com/docs/flip#combining-with-shift
      crossAxis: false,
      boundary: document.body,
    }),
    shift(),
  ];

  const { context, refs, floatingStyles } = useFloating({
    open: isOpen,
    placement: 'top-start',
    onOpenChange: setIsOpen,
    middleware,
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, click]);

  const onChangeInternal = (item: SelectableValue<T>) => {
    onChange(item);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper} {...TEST_IDS.buttonSelect.root.apply()}>
      <ToolbarButton
        className={className}
        isOpen={isOpen}
        narrow={narrow}
        variant={variant}
        ref={refs.setReference}
        {...getReferenceProps()}
        {...restProps}
      >
        {value?.label || String(value?.value)}
      </ToolbarButton>
      {isOpen && (
        <div
          className={styles.menuWrapper}
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          {...TEST_IDS.buttonSelect.dropdown.apply()}
        >
          <FocusScope contain autoFocus restoreFocus>
            {/*
              tabIndex=-1 is needed here to support highlighting text within the menu when using FocusScope
              see https://github.com/adobe/react-spectrum/issues/1604#issuecomment-781574668
            */}
            <Menu tabIndex={-1}>
              {options.map((item) => (
                <MenuItem
                  key={`${item.value}`}
                  label={String(item.value)}
                  onClick={() => onChangeInternal(item)}
                  active={item.value === value?.value}
                  ariaChecked={item.value === value?.value}
                  ariaLabel={item.ariaLabel || item.label}
                  disabled={item.isDisabled}
                  component={item.component}
                  role="menuitemradio"
                  {...TEST_IDS.buttonSelect.option.apply(item.value)}
                />
              ))}
            </Menu>
          </FocusScope>
        </div>
      )}
    </div>
  );
};
