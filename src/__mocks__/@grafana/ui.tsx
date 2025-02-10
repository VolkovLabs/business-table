import { dateTime, Field, LinkModel, SelectableValue } from '@grafana/data';
import React, { useState } from 'react';

import { TEST_IDS } from '@/constants';

const actual = jest.requireActual('@grafana/ui');

/**
 * Button
 */
const ButtonMock = ({ children, ...restProps }: any) => <button {...restProps}>{children}</button>;
const Button = jest.fn(ButtonMock);

/**
 * Mock Select component
 */
const SelectMock = ({
  options,
  onChange,
  value,
  isMulti,
  isClearable,
  allowCustomValue,
  invalid,
  noOptionsMessage,
  formatOptionLabel,
  isLoading,
  onOpenMenu,
  onCloseMenu,
  inputId,
  isSearchable,
  ...restProps
}: any) => (
  <select
    onChange={(event: any) => {
      if (onChange) {
        if (isMulti) {
          const newOptions = allowCustomValue
            ? event.target.values.map((value: string) => ({
                value,
              }))
            : options.filter((option: any) => event.target.values.includes(option.value));
          onChange(newOptions);
        } else {
          const plainOptions = options.reduce(
            (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
            []
          );
          // eslint-disable-next-line eqeqeq
          const option = plainOptions.find((option: any) => option.value == event.target.value);

          if (!option?.isDisabled) {
            onChange(option);
          }
        }
      }
    }}
    /**
     * Fix jest warnings because null value.
     * For Select component in @grafana/ui should be used null to reset value.
     */
    value={value === null ? '' : value?.value || value}
    multiple={isMulti}
    {...restProps}
  >
    {isClearable && (
      <option key="clear" value="">
        Clear
      </option>
    )}
    {(allowCustomValue
      ? (Array.isArray(value) ? value : [value])
          .map((value: string) => ({
            value,
            label: value,
          }))
          .concat(options.filter((option: any) => option.value !== value))
      : options.reduce(
          (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
          []
        )
    ).map(({ label, value }: any, index: number) => (
      <option key={index} value={value}>
        {label}
      </option>
    ))}
  </select>
);

const Select = jest.fn(SelectMock);

/**
 * Mock Button Select
 */
const ButtonSelect = jest.fn(SelectMock);

/**
 * Mock Button Row Toolbar
 */
const ToolbarButtonRowMock = ({ leftItems, children }: any) => {
  return (
    <>
      {leftItems}
      {children}
    </>
  );
};

const ToolbarButtonRow = jest.fn(ToolbarButtonRowMock);

/**
 * Mock DataLinksContextMenu component
 */
const DataLinksContextMenuMock = ({ ...restProps }: any) => {
  /**
   * Get links
   */
  const links: Array<LinkModel<Field>> = restProps.links();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * mock api to open menu
   */
  const api = {
    openMenu: jest.fn(() => setIsOpen(true)),
  };

  return (
    <>
      {isOpen && (
        <div>
          {links.map((link) => (
            <a key={link.title} href={link.href} {...TEST_IDS.tableCell.tableLink.apply(link.title)}>
              {link.title}
            </a>
          ))}
        </div>
      )}
      {restProps.children(api)}
    </>
  );
};

const DataLinksContextMenu = jest.fn(DataLinksContextMenuMock);

/**
 * Mock TimeRangeInput component
 */
const TimeRangeInputMock = ({ onChange, ...restProps }: any) => {
  return (
    <input
      data-testid={restProps['data-testid']}
      value={restProps.value}
      onChange={(event) => {
        if (onChange) {
          onChange(event.target.value);
        }
      }}
    />
  );
};

const TimeRangeInput = jest.fn(TimeRangeInputMock);

/**
 * Mock Popover
 */
const PopoverMock = ({ content, show }: any) => (show ? content : null);

const Popover = jest.fn(PopoverMock);

/**
 * Mock DatetimePicker component
 */
const DateTimePickerMock = ({ onChange, ...restProps }: any) => {
  return (
    <input
      data-testid={restProps['data-testid']}
      value={restProps.value}
      onChange={(event) => {
        if (onChange) {
          onChange(dateTime(event.target.value));
        }
      }}
    />
  );
};

const DateTimePicker = jest.fn(DateTimePickerMock);

/**
 * Pagination
 */
const PaginationMock = ({ onNavigate, currentPage, numberOfPages, ...restProps }: any) => {
  const options = [];

  for (let page = 1; page <= numberOfPages; page += 1) {
    options.push({
      value: page,
      label: page,
    });
  }

  return (
    <Select
      value={currentPage}
      options={options}
      onChange={(event: any) => onNavigate(event.value)}
      data-testid={restProps['data-testid']}
    />
  );
};

const Pagination = jest.fn(PaginationMock);

const MenuItemMock = ({ onClick, children, currentPage, numberOfPages, ...restProps }: any) => {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      aria-label={restProps['aria-label']}
      data-testid={restProps['data-testid']}
    >
      {restProps.label}
    </button>
  );
};

const MenuItem = jest.fn(MenuItemMock);

/**
 * Stats Picker
 */
const StatsPickerMock = SelectMock;

const StatsPicker = jest.fn(StatsPickerMock);

/**
 * Mock Card Description to prevent validateDOMNesting error
 */
(actual.Card as any).Description = ({ children }: any) => children;

/**
 * Mock Confirm Modal
 */
const ConfirmModalMock = ({ onConfirm, onDismiss, isOpen = true, ...restProps }: any) => {
  return isOpen ? (
    <div data-testid={restProps['data-testid']}>
      <button data-testid="confirm" onClick={onConfirm} />
      <button data-testid="dismiss" onClick={onDismiss} />
    </div>
  ) : null;
};

const ConfirmModal = jest.fn(ConfirmModalMock);

/**
 * Mock ColorPickerInput component
 */
const ColorPickerMock = ({ onChange, value, ...restProps }: any) => {
  return (
    <input
      data-testid={restProps['data-testid']}
      value={value}
      onChange={(event) => {
        if (onChange) {
          onChange(event.target.value);
        }
      }}
    />
  );
};

const ColorPicker = jest.fn(ColorPickerMock);

/**
 * Tooltip
 */
const TooltipMock = ({ content, children, ...restProps }: any) => {
  return (
    <div data-testid={restProps['data-testid']}>
      <p>{content}</p>
      {children}
    </div>
  );
};

/**
 * Mock Dropdown component
 */
const DropdownMock = ({ children, overlay, ...restProps }: any) => {
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <div data-testid={restProps['data-testid']} onClick={() => setOpenMenu((prevState) => !prevState)}>
      {openMenu && <div>{overlay}</div>}
      {children}
    </div>
  );
};

const Tooltip = jest.fn(TooltipMock);
const Dropdown = jest.fn(DropdownMock);

/**
 * BarGauge
 */
const BarGaugeMock = ({ value, ...restProps }: any) => {
  return (
    <div
      data-testid={restProps['data-testid']}
      className={restProps['className']}
      style={{
        width: restProps.width,
      }}
    >
      {value.text}
    </div>
  );
};

const BarGauge = jest.fn(BarGaugeMock);

beforeEach(() => {
  Button.mockImplementation(ButtonMock);
  Select.mockImplementation(SelectMock);
  ButtonSelect.mockImplementation(SelectMock);
  ToolbarButtonRow.mockImplementation(ToolbarButtonRowMock);
  TimeRangeInput.mockImplementation(TimeRangeInputMock);
  Popover.mockImplementation(PopoverMock);
  DateTimePicker.mockImplementation(DateTimePickerMock);
  Pagination.mockImplementation(PaginationMock);
  MenuItem.mockImplementation(MenuItemMock);
  DataLinksContextMenu.mockImplementation(DataLinksContextMenuMock);
  StatsPicker.mockImplementation(StatsPickerMock);
  ConfirmModal.mockImplementation(ConfirmModalMock);
  ColorPicker.mockImplementation(ColorPickerMock);
  Tooltip.mockImplementation(TooltipMock);
  Dropdown.mockImplementation(DropdownMock);
  Tooltip.mockImplementation(TooltipMock);
  BarGauge.mockImplementation(BarGaugeMock);
});

module.exports = {
  ...actual,
  Select,
  Button,
  BarGauge,
  ToolbarButtonRow,
  ButtonSelect,
  TimeRangeInput,
  Popover,
  DateTimePicker,
  Pagination,
  MenuItem,
  DataLinksContextMenu,
  StatsPicker,
  ConfirmModal,
  ColorPicker,
  Tooltip,
  Dropdown,
};
