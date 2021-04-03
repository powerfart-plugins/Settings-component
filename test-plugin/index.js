const { Plugin } = require('powercord/entities');
const Settings = require('../Settings.jsx');

module.exports = class TS extends Plugin {
  async startPlugin () {
    Settings.registerSettings({
      entityID: this.entityID,
      label: 'Test settings',
      items: [
        {
          type: 'switch',
          name: 'switch 1',
          key: 'switch-1',
          def: true
        },
        {
          type: 'category',
          items: [
            {
              type: 'switch',
              name: 'switch 1 1',
              value: true
            },
            {
              type: 'switch',
              name: 'switch 1 2',
              value: false,
              note: 'switch 1 2 note'
            },
            {
              type: 'colorPicker',
              name: 'Color Picker',
              note: 'Color Picker Note'
            }
          ]
        },
        {
          type: 'slider',
          name: 'Slider',
          sequenceNumsUp: 10,
          value: 2
        }
      ]
    });
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('test-plugin-settings');
  }
};
