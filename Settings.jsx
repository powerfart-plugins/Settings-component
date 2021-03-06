/** A settings component that does routine work for you
 * @author Xinos#2003
 * @licence MIT
 * @version 1.3
 * @link https://github.com/powerfart-plugins/Settings-component
 * @docs https://github.com/powerfart-plugins/Settings-component#documentation
 * @copyright (c) 2021 Xinos
 */

const { SwitchItem, TextInput, Category, ColorPickerInput, SliderInput, SelectInput, RadioGroup, CheckboxInput } = require('powercord/components/settings');
const { TabBar } = require('powercord/components');
const { React, getModule, constants: { DEFAULT_ROLE_COLOR } } = require('powercord/webpack');

/* eslint-disable no-undefined, object-property-newline, no-use-before-define */
// noinspection JSUnresolvedFunction
class Settings extends React.Component {
  /**
   * Automatically register settings
   * @param {Object} params
   * @param {String} params.id by default = `entityID-settings`
   * @param {String} params.entityID
   * @param {String} params.label by default = entityID to titleCase
   * @param {Array} params.items
   */
  static register ({ id, entityID, label, items }) {
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
      category: this.renderCategory.bind(this),
      tabBar: this.renderTabBar.bind(this)
    };
  }

  renderItems (items) {
    return items.map((item) => {
      const render = this.itemsTypes[item.type];
      return (render) ? render(item) : null;
    });
  }

  renderSwitch (item) {
    const { key, def, onClick, name } = item;
    const { getSetting, toggleSetting } = this.props;
    const value = this._getValue(item.value);

    return (
      <SwitchItem
        {...item}
        children={name}
        onChange={(v) => (onClick) ? this._passSetting(v, onClick) : toggleSetting(key, def)}
        value={(key) ? getSetting(key, def) : value}
      />
    );
  }

  renderColorPicker (item) {
    const { key, def, onChange } = item;
    const { getSetting, updateSetting } = this.props;
    const realDef = (def === undefined) ? DEFAULT_ROLE_COLOR : def;
    const value = this._getValue(item.value);

    return (
      <ColorPickerInput
        {...item}
        value={(key) ? getSetting(key, realDef) : value}
        onChange={(v) => (onChange) ? this._passSetting(v, onChange) : updateSetting(key, ((v === realDef) ? null : v))}
        children={item.name}
        default={item.defaultColor}
        defaultColors={item.defaultColors}
      />
    );
  }

  renderSlider (item) {
    const { key, def, sequenceNumsUp, onChange, keyboardStep, stickToMarkers, name } = item;
    const { getSetting, updateSetting } = this.props;
    const value = this._getValue(item.value);

    if (sequenceNumsUp) {
      item.markers = Array.from(
        { length: sequenceNumsUp },
        (_, i) => i + 1
      );
    }
    return (
      <SliderInput
        {...item}
        initialValue={(key) ? getSetting(key, def) : value}
        onValueChange={(v) => (onChange) ? this._passSetting(v, onChange) : updateSetting(key, v)}
        keyboardStep={(keyboardStep === undefined) ? 1 : keyboardStep}
        stickToMarkers={(stickToMarkers === undefined) ? true : stickToMarkers}
        children={name}
      />
    );
  }

  renderSelect (item) {
    const { key, def, onChange, items, name } = item;
    const { getSetting, updateSetting } = this.props;
    const value = this._getValue(item.value);

    return (
      <SelectInput
        {...item}
        value={(key) ? getSetting(key, def) : value}
        onChange={(v) => (onChange) ? this._passSetting(v, onChange) : updateSetting(key, v.value)}
        options={items}
        children={name}
      />
    );
  }

  renderText (item) {
    const { key, def, name, onChange, debounce } = item;
    const { getSetting, updateSetting } = this.props;
    const value = this._getValue(item.value);
    const defaultValue = this._getValue(item.default);
    const runDebounce = (() => {
      let timer = null;
      return (callback) => {
        clearTimeout(timer);
        timer = setTimeout(callback, debounce || 250);
      };
    })();

    function WrapTextInput (props) { // It is necessary to expand the functionality, so far only Errors
      const [ error, onError ] = React.useState(null);
      const newProps = {
        ...props,
        error,
        onChange: (v) => {
          onError(null);
          runDebounce(() => {
            const res = props.onChange(v);
            onError(res?.error);
          });
        }
      };

      return <TextInput {...newProps}/>;
    }

    return (
      <WrapTextInput
        {...item}
        value={(key) ? getSetting(key, def) : value}
        defaultValue={(key) ? getSetting(key, def) : defaultValue}
        onChange={(v) => (onChange) ? this._passSetting(v, onChange) : updateSetting(key, v)}
        children={name}
      />
    );
  }

  renderRadioGroup (item) {
    const { key, def, onChange, name, items } = item;
    const { getSetting, updateSetting } = this.props;
    const value = this._getValue(item.value);

    return (
      <RadioGroup
        {...item}
        value={(key) ? getSetting(key, def) : value}
        onChange={(v) => (onChange) ? this._passSetting(v, onChange) : updateSetting(key, v.value)}
        options={items}
        children={name}
      />
    );
  }

  renderCheckbox (item) {
    const { key, def, onClick, name } = item;
    const { getSetting, toggleSetting } = this.props;
    const auto = (key && (def !== undefined));

    return (
      <CheckboxInput
        {...item}
        onChange={(v) => (onClick) ? this._passSetting(v, onClick) : toggleSetting(key, v)}
        value={(auto) ? getSetting(key, def) : item.value }
        children={name}
      />
    );
  }

  renderCategory (item) {
    const Category2 = (props) => {
      const def = (props.opened === undefined) ? true : props.opened;
      const [ opened, onChange ] = React.useState(def);
      props = { ...props, onChange, opened };

      return <Category {...props}/>;
    };

    return (
      <Category2{...item}>
        {this.renderItems(item.items)}
      </Category2>
    );
  }

  renderTabBar (item) {
    const classes = getModule([ 'topPill', 'item' ], false);
    const TabBar2  = (props) => {
      const def = (props.selected === undefined) ? 0 : props.selected;
      const [ selectedItem, onItemSelect ] = React.useState(def);
      props = {
        ...props,
        selectedItem,
        onItemSelect,
        type: classes.topPill
      };

      return (
        <div className='powercord-entities-manage powercord-text'>
          <div className='powercord-entities-manage-tabs'>
            <TabBar {...props}>
              {
                props.items.map((item, index) => (
                  <TabBar.Item
                    id={String(index)}
                    selectedItem={selectedItem}
                    className={classes.item}
                  >
                    {item.name}
                  </TabBar.Item>
                ))
              }
            </TabBar>
          </div>
          { this.renderItems(props.items[selectedItem].items) }
        </div>
      );
    };

    return <TabBar2 {...item}/>;
  }

  _passSetting (value = null, handler) {
    const { getSetting, updateSetting, toggleSetting } = this.props;
    return handler({ getSetting, updateSetting, toggleSetting }, value);
  }

  _getValue (v) {
    return (typeof v === 'function') ? this._passSetting(null, v) : v;
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
