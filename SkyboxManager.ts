import * as hz from 'horizon/core';

// Interface for environment preset configuration (simplified for environment gizmos)
interface EnvironmentPreset {
  name: string;
  asset: hz.Asset | null;
}

// Single CodeBlock Event for environment preset updates
const updateEnvironmentPresetEvent = new hz.CodeBlockEvent<[number]>('updateEnvironmentPreset', [hz.PropTypes.Number]);

// LocalEvent for inter-script communication
export const updateEnvironment = new hz.LocalEvent<[number]>('updateEnvironment');

class SkyboxManager extends hz.Component<typeof SkyboxManager> {
  static propsDefinition = {
    // Environment Preset 1
    preset1Name: { type: hz.PropTypes.String, default: "Day Environment" },
    preset1Asset: { type: hz.PropTypes.Asset },
    
    // Environment Preset 2
    preset2Name: { type: hz.PropTypes.String, default: "Night Environment" },
    preset2Asset: { type: hz.PropTypes.Asset },
   
    // Environment Preset 3
    preset3Name: { type: hz.PropTypes.String, default: "Custom Environment" },
    preset3Asset: { type: hz.PropTypes.Asset },
    
    // General settings
    enableLogging: { type: hz.PropTypes.Boolean, default: true }
  };

  // Track currently spawned environment object (single gizmo)
  private currentSpawnedObject: hz.Entity | null = null;
  private currentPresetIndex: number = -1;
  private isSpawning: boolean = false;



  start() {
    this.log("SkyboxManager initialized");
    
    // Set up event listener for preset switching (CodeBlock event)
    this.connectCodeBlockEvent(this.entity, updateEnvironmentPresetEvent, (presetIndex: number) => {
      this.handleEnvironmentUpdate(presetIndex);
    });

    // Set up LocalEvent listener for inter-script communication
    this.connectLocalBroadcastEvent( updateEnvironment, (payload: [number]) => {
      this.handleEnvironmentUpdate(payload[0]);
    });

    this.handleEnvironmentUpdate(1); // Start with no environment
  }

  /**
   * Handle environment update with preset index
   * @param presetIndex - The preset index (0 = clear, 1-3 = switch to preset)
   */
  private handleEnvironmentUpdate(presetIndex: number): void {
    if (presetIndex === 0) {
      this.clearCurrentEnvironment();
    } else if (presetIndex >= 1 && presetIndex <= 3) {
      this.switchToPreset(presetIndex);
    } else {
      this.log(`Invalid preset index: ${presetIndex}. Use 0 to clear, 1-3 for presets.`);
    }
  }

  /**
   * Switch to a specific environment preset
   * @param presetIndex - The preset index (1, 2, or 3)
   */
  private async switchToPreset(presetIndex: number): Promise<void> {
    if (this.isSpawning) {
      this.log("Already spawning/despawning objects, please wait...");
      return;
    }

    if (this.currentPresetIndex === presetIndex) {
      this.log(`Preset ${presetIndex} is already active`);
      return;
    }

    this.isSpawning = true;
    
    try {
      // Clear current environment first
      await this.clearCurrentEnvironment();
      
      // Get the preset configuration
      const preset = this.getPresetConfiguration(presetIndex);
      if (!preset || !this.validatePreset(preset)) {
        this.log(`Invalid or incomplete preset configuration for preset ${presetIndex}`);
        return;
      }

      this.log(`Switching to preset ${presetIndex}: ${preset.name}`);
      
      // Spawn new environment
      await this.spawnEnvironmentPreset(preset);
      this.currentPresetIndex = presetIndex;
      
      this.log(`Successfully switched to preset ${presetIndex}`);
    } catch (error) {
      this.log(`Error switching to preset ${presetIndex}: ${error}`);
    } finally {
      this.isSpawning = false;
    }
  }

  /**
   * Clear the currently spawned environment object
   */
  private async clearCurrentEnvironment(): Promise<void> {
    if (!this.currentSpawnedObject) {
      this.log("No environment object to clear");
      return;
    }

    this.log("Clearing current environment object...");
    
    try {
      await this.world.deleteAsset(this.currentSpawnedObject, true);
      this.currentSpawnedObject = null;
      this.currentPresetIndex = -1;
      this.log("Environment cleared successfully");
    } catch (error) {
      this.log(`Error clearing environment: ${error}`);
      // Reset reference even if deletion failed
      this.currentSpawnedObject = null;
      this.currentPresetIndex = -1;
    }
  }

  /**
   * Spawn the environment gizmo for a preset
   * @param preset - The environment preset to spawn
   */
  private async spawnEnvironmentPreset(preset: EnvironmentPreset): Promise<void> {
    if (!preset.asset) {
      this.log(`No asset defined for preset: ${preset.name}`);
      return;
    }

    this.log(`Spawning environment gizmo for ${preset.name}...`);
    
    try {
      // Use default position (0,0,0), identity rotation, and scale (1,1,1) for environment gizmos
      const position = new hz.Vec3(0, 0, 0);
      const rotation = new hz.Quaternion(0, 0, 0, 1);
      const scale = new hz.Vec3(1, 1, 1);

      const spawnedEntities = await this.world.spawnAsset(preset.asset, position, rotation, scale);
      
      if (spawnedEntities.length > 0) {
        this.currentSpawnedObject = spawnedEntities[0]; // Take the first entity as the main reference
        this.log(`Successfully spawned environment gizmo for ${preset.name}`);
      } else {
        this.log(`No entities were spawned for ${preset.name}`);
      }
    } catch (error) {
      this.log(`Error spawning preset asset: ${error}`);
      // Ensure cleanup if spawn partially failed
      await this.clearCurrentEnvironment();
    }
  }

  /**
   * Get the configuration for a specific preset
   * @param presetIndex - The preset index (1, 2, or 3)
   * @returns The preset configuration or null if invalid
   */
  private getPresetConfiguration(presetIndex: number): EnvironmentPreset | null {
    switch (presetIndex) {
      case 1:
        return {
          name: this.props.preset1Name,
          asset: this.props.preset1Asset || null
        };
      case 2:
        return {
          name: this.props.preset2Name,
          asset: this.props.preset2Asset || null
        };
      case 3:
        return {
          name: this.props.preset3Name,
          asset: this.props.preset3Asset || null
        };
      default:
        return null;
    }
  }

  /**
   * Utility method for logging with optional enable/disable
   * @param message - The message to log
   */
  private log(message: string): void {
    if (this.props.enableLogging) {
      console.log(`[SkyboxManager] ${message}`);
    }
  }

  /**
   * Get information about the current environment state
   * @returns Object with current state information
   */
  public getCurrentEnvironmentInfo(): { presetIndex: number; hasSpawnedObject: boolean; isSpawning: boolean } {
    return {
      presetIndex: this.currentPresetIndex,
      hasSpawnedObject: this.currentSpawnedObject !== null,
      isSpawning: this.isSpawning
    };
  }

  /**
   * Validate a preset configuration
   * @param preset - The preset to validate
   * @returns True if valid, false otherwise
   */
  private validatePreset(preset: EnvironmentPreset): boolean {
    if (!preset) {
      this.log("Preset is null or undefined");
      return false;
    }

    if (!preset.asset) {
      this.log(`Preset "${preset.name}" has no asset defined`);
      return false;
    }

    return true;
  }

  /**
   * Force stop any ongoing spawning operation
   */
  public forceStopSpawning(): void {
    if (this.isSpawning) {
      this.log("Force stopping spawning operation");
      this.isSpawning = false;
    }
  }



  /**
   * Emergency cleanup - attempt to delete the tracked object
   */
  public async emergencyCleanup(): Promise<void> {
    this.log("Performing emergency cleanup...");
    this.forceStopSpawning();
    await this.clearCurrentEnvironment();
    this.log("Emergency cleanup completed");
  }


}

hz.Component.register(SkyboxManager);