/*
 * Copyright (c) 2021 Xinos
 * Licensed under the MIT
 */

const { SwitchItem, TextInput, Category, ColorPickerInput, SliderInput, SelectInput, RadioGroup, CheckboxInput } = require('powercord/components/settings');
const { React, getModule, constants: { DEFAULT_ROLE_COLOR } } = require('powercord/webpack');

/* eslint-disable no-undefined, object-property-newline, no-use-before-define */
class Settings extends React.Component {
  /**
   * Automatically register settings
   * @param {Object} params
   * @param {String} params.id by default = `entityID-settings`
   * @param {String} params.entityID
   * @param {String} params.label by default = entityID to titleCase
   * @param {Array} params.items
   */
  static registerSettings ({ id, entityID, label, items }) {
    id = (id) ? id : `${entityID}-settings`;
    label = (label) ? label : snake2title(entityID);

    powercord.api.settings.registerSettings(id, {
      category: entityID,
      label,
      render: (settings) => React.createElement(Settings, { ...settings, items })
    });
  }

  render () {
    return <>
      { this.renderItems(this.props.items) }
    </>;
  }

  get itemsTypes () {
    return {
      switch: this.renderSwitch.bind(this),
      colorPicker: this.renderColorPicker.bind(this),
      slider: this.renderSlider.bind(this),
      select: this.renderSelect.bind(this),
      text: this.renderText.bind(this),
      radioGroup: this.renderRadioGroup.bind(this),
      checkbox: this.renderCheckbox.bind(this),
      category: this.renderCategory.bind(this)
    };
  }

  renderItems (items) {
    return items.map((item) => {
      const render = this.itemsTypes[item.type];
      return (render) ? render(item) : null;
    });
  }

  renderSwitch (item) {
    const { key, def } = item;
    const { getSetting, toggleSetting } = this.props;
    const auto = (key && (def !== undefined));

    return (
      <SwitchItem
        children={item.name}
        onChange={(auto) ? () => toggleSetting(key, def) : item.onClick}
        value={(auto) ? getSetting(key, def) : item.value }
        {...item}
      />
    );
  }

  renderColorPicker (item) {
    const { hex2int, int2hex } = getModule([ 'isValidHex' ], false);
    const { key, def } = item;
    const { getSetting, updateSetting } = this.props;
    const realDef = (def === undefined) ? DEFAULT_ROLE_COLOR : def;

    return (
      <ColorPickerInput
        value={(key) ? hex2int(getSetting(key, realDef)) : item.value}
        onChange={(key) ? ((v) => updateSetting(key, (v === realDef) ? null : int2hex(v))) : item.onChange}
        children={item.name}
        default={item.defaultColor}
        defaultColors={item.defaultColors}
        {...item}
      />
    );
  }

  renderSlider (item) {
    const { key, def, sequenceNumsUp, renderMarker, value, onChange, keyboardStep, stickToMarkers } = item;
    const { getSetting, updateSetting } = this.props;
    const auto = (key && (def !== undefined));

    if (sequenceNumsUp) {
      item.markers = Array.from(
        { length: sequenceNumsUp },
        (_, i) => i + 1
      );
    }
    return (
      <SliderInput
        onMarkerRender={(e) => (renderMarker === undefined) ? e : renderMarker}
        initialValue={(auto) ? getSetting(key, def) : value}
        onValueChange={(auto) ? ((v) => updateSetting(key, v)) : onChange}
        keyboardStep={(keyboardStep === undefined) ? 1 : keyboardStep}
        stickToMarkers={(stickToMarkers === undefined) ? true : stickToMarkers}
        children={item.name}
        {...item}
      />
    );
  }

  renderSelect (item) {
    const { key, def } = item;
    const { getSetting, updateSetting } = this.props;
    const auto = (key && (def !== undefined));

    return (
      <SelectInput
        value={(auto) ? getSetting(key, def) : item.value}
        onChange={(auto) ? (({ value }) => updateSetting(key, value)) : item.onChange}
        options={item.items}
        children={item.name}
        {...item}
      />
    );
  }

  renderText (item) {
    const { key, def } = item;
    const { getSetting, updateSetting } = this.props;
    const auto = (key && (def !== undefined));

    return (
      <TextInput
        value={(auto) ? getSetting(key, def) : item.value}
        onChange={(auto) ? ((v) => updateSetting(key, v)) : item.onChange}
        defaultValue={item.default}
        children={item.name}
        {...item}
      />
    );
  }

  renderRadioGroup (item) {
    const { key, def } = item;
    const { getSetting, updateSetting } = this.props;
    const auto = (key && (def !== undefined));

    return (
      <RadioGroup
        value={(auto) ? getSetting(key, def) : item.value}
        onChange={(auto) ? (({ value }) => updateSetting(key, value)) : item.onChange}
        options={item.items}
        children={item.name}
        {...item}
      />
    );
  }

  renderCheckbox (item) {
    const { key, def } = item;
    const { getSetting, toggleSetting } = this.props;
    const auto = (key && (def !== undefined));

    return (
      <CheckboxInput
        onChange={(auto) ? () => toggleSetting(key, def) : item.onClick}
        value={(auto) ? getSetting(key, def) : item.value }
        children={item.name}
        {...item}
      />
    );
  }

  renderCategory (item) {
    return (
      <this._Category2
        children={this.renderItems(item.items)}
        {...item}
      />
    );
  }

  _Category2 (props) {
    const def = (props.opened === undefined) ? true : props.opened;
    const [ opened, onChange ] = React.useState(def);
    props = { ...props, onChange, opened }; // eslint-disable-line object-property-newline

    return <Category {...props}/>;
  }
}

function snake2title (snakeCase) {
  return snakeCase
    .toLowerCase()
    .split('-')
    .map((str) => (
      str.charAt(0).toUpperCase() + str.slice(1)
    ))
    .join(' ');
}

module.exports = Settings;
