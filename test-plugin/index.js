const { Plugin } = require('powercord/entities');
const Settings = require('../Settings.jsx');

module.exports = class TS extends Plugin {
  async startPlugin () {
    Settings.register({
      entityID: this.entityID,
      label: 'Test settings',
      items: [
        {
          type: 'switch',
          name: 'Switch',
          note: 'Note It\'s switch #1',
          key: 'switch1',
          def: true
        },
        {
          type: 'category',
          name: 'category #1',
          items: [
            {
              type: 'colorPicker',
              name: 'Color Picker',
              key: 'colorPicker1'
            },
            {
              type: 'slider',
              name: 'Slider',
              key: 'slider1',
              def: 8,
              sequenceNumsUp: 10,
              onMarkerRender: (e) => `${e}x`
            }
          ]
        },
        {
          type: 'category',
          name: 'category #2',
          items: [
            {
              type: 'switch',
              name: 'Switch #2.1',
              key: 'switch21',
              def: false
            },
            {
              type: 'select',
              name: 'Select',
              key: 'select1',
              def: 2,
              items: [
                { label: '1',
                  value: 1 },
                { label: '2',
                  value: 2 },
                { label: '2',
                  value: 2 },
                { label: '2',
                  value: 2 }
              ]
            },
            {
              type: 'text',
              name: ({ getSetting }) => 'Text',
              note: 'It\'s text',
              default: 'blblblblblblba',
              onChange: ({ updateSetting }, value) => ({
                error: 'It\'s not a valid text'
              })
            }
          ]
        }
      ]
    });
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('test-plugin-settings');
  }
};
