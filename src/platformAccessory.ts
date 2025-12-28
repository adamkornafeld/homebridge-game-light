import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { GameLightPlatform } from './platform.js';

/**
 * GameLightAccessory
 *
 * Exposes a simple Switch that turns ON when the tracked team is playing.
 * Users create HomeKit automations based on this switch to control their lights.
 */
export class GameLightAccessory {
  private readonly service: Service;
  private isGameActive = false;

  constructor(
    private readonly platform: GameLightPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // Set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Game Light')
      .setCharacteristic(this.platform.Characteristic.Model, 'Game Switch')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        accessory.context.teamTricode || 'GAME',
      );

    // Get or create Switch service
    this.service =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);

    // Set the service name
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.displayName || 'Game Active',
    );

    // Register handlers for On/Off
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.handleSetOn.bind(this))
      .onGet(this.handleGetOn.bind(this));

    this.platform.log.debug('Game Active switch initialized');
  }

  /**
   * Called by the platform when game state changes
   */
  setGameActive(active: boolean): void {
    if (this.isGameActive !== active) {
      this.isGameActive = active;
      this.service.updateCharacteristic(
        this.platform.Characteristic.On,
        active,
      );
      this.platform.log.info(`${this.platform.sportEmoji} Game Active: ${active ? 'ON' : 'OFF'}`);
    }
  }

  /**
   * Get current game active state
   */
  getGameActive(): boolean {
    return this.isGameActive;
  }

  /**
   * Handle manual toggle from Home app (for testing)
   */
  private async handleSetOn(value: CharacteristicValue): Promise<void> {
    const newValue = value as boolean;
    this.isGameActive = newValue;
    this.platform.log.debug(`Manual toggle: Game Active → ${newValue}`);
  }

  private async handleGetOn(): Promise<CharacteristicValue> {
    return this.isGameActive;
  }
}
