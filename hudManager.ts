import * as hz from "horizon/core";
import * as ui from "horizon/ui";

// Interface for tracking HUD assignments
interface HudAssignment {
  hudEntity: hz.Entity;
  assignedPlayer: hz.Player | null;
  isInUse: boolean;
  hudType: 'hud' | 'hud2'; // Track which type of HUD this is
}

/**
 * HudManager handles ownership and assignment of HUD entities to players
 * Manages both "hud" (GameOverModal) and "hud2" (viewport-filling HUD) entities
 * Similar to PhoneManager, manages entity ownership and visibility
 */
export class HudManager extends ui.UIComponent {
  private hudAssignments: HudAssignment[] = [];
  private hud2Assignments: HudAssignment[] = [];

  initializeUI() {
    // HudManager doesn't render UI, but must return a valid UINode
    return ui.View({
      style: {
        width: 0,
        height: 0
      },
      children: []
    });
  }

  async start() {
    
    // Discover all HUD entities with the "hud" and "hud2" tags
    this.discoverHudEntities();
    this.discoverHud2Entities();
    
    // Set up player enter/exit event handlers
    this.setupPlayerEvents();

  }

  /**
   * Discovers all entities with the "hud" tag and adds them to management
   */
  private discoverHudEntities(): void {
    
    const hudEntities = this.world.getEntitiesWithTags(['hud']);

    hudEntities.forEach((hudEntity: hz.Entity, index: number) => {
      this.hudAssignments.push({
        hudEntity: hudEntity,
        assignedPlayer: null,
        isInUse: false,
        hudType: 'hud'
      });
      
      // Initially hide all HUDs - they'll be shown when assigned to players
      hudEntity.visible.set(false);
      
    });

  }

  /**
   * Discovers all entities with the "hud2" tag and adds them to management
   * Note: hud2 entities are typically used with Screen Overlay mode,
   * which should be visible by default for all players
   */
  private discoverHud2Entities(): void {
    
    const hud2Entities = this.world.getEntitiesWithTags(['hud2']);

    hud2Entities.forEach((hud2Entity: hz.Entity, index: number) => {
      this.hud2Assignments.push({
        hudEntity: hud2Entity,
        assignedPlayer: null,
        isInUse: false,
        hudType: 'hud2'
      });
      
      // For Screen Overlay mode, ensure the entity is visible
      // Screen Overlay automatically shows to all players when entity is visible
      hud2Entity.visible.set(true);
      
    });

  }

  /**
   * Sets up player enter/exit event handlers
   */
  private setupPlayerEvents(): void {
    // Handle player joining
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerEnterWorld,
      (player: hz.Player) => this.onPlayerEnter(player)
    );

    // Handle player leaving
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerExitWorld,
      (player: hz.Player) => this.onPlayerExit(player)
    );

  }

  /**
   * Handles player entering the world - assigns them a HUD
   * Both hud and hud2 need ownership assignment to determine which player sees them
   */
  private onPlayerEnter(player: hz.Player): void {
    this.assignHudToPlayer(player);
    this.assignHud2ToPlayer(player); // Screen Overlay needs ownership to know which player to show it to
  }

  /**
   * Handles player exiting the world - releases their HUD
   */
  private onPlayerExit(player: hz.Player): void {
    this.releasePlayerHud(player);
    this.releasePlayerHud2(player); // Release the Screen Overlay HUD ownership
  }

  /**
   * Assigns an available HUD to a player
   */
  public assignHudToPlayer(player: hz.Player): boolean {
    const playerId = player.id.toString();
    
    // Check if player already has a HUD assigned
    const existingAssignment = this.hudAssignments.find(
      assignment => assignment.assignedPlayer === player
    );

    if (existingAssignment) {
      // Ensure it's visible and owned by the player
      this.ensureHudOwnership(existingAssignment, player);
      return true;
    }

    // Find an available HUD
    const availableHud = this.hudAssignments.find(
      assignment => !assignment.isInUse && assignment.assignedPlayer === null
    );

    if (availableHud) {
      
      // Assign the HUD to the player
      availableHud.assignedPlayer = player;
      availableHud.isInUse = true;

      // Set ownership and make visible to the player
      this.ensureHudOwnership(availableHud, player);
      
      return true;
    } else {
      return false;
    }
  }

  /**
   * Ensures proper ownership and visibility of a HUD for a player
   */
  private ensureHudOwnership(assignment: HudAssignment, player: hz.Player): void {
    try {
      // Set ownership to the specific player
      assignment.hudEntity.owner.set(player);
      
      // Make the HUD visible
      assignment.hudEntity.visible.set(true);
      
      
    } catch (error) {
    }
  }

  /**
   * Releases a player's HUD assignment
   */
  public releasePlayerHud(player: hz.Player): void {
    const playerAssignment = this.hudAssignments.find(
      assignment => assignment.assignedPlayer === player
    );

    if (playerAssignment) {
      
      try {
        // Hide the HUD entity
        playerAssignment.hudEntity.visible.set(false);

        // Mark as available
        playerAssignment.assignedPlayer = null;
        playerAssignment.isInUse = false;
        
        
      } catch (error) {
        // Still mark as available even if there was an error
        playerAssignment.assignedPlayer = null;
        playerAssignment.isInUse = false;
      }
    } else {
    }
  }

  /**
   * Gets the HUD entity assigned to a specific player
   */
  public getPlayerHud(player: hz.Player): hz.Entity | null {
    const assignment = this.hudAssignments.find(
      assignment => assignment.assignedPlayer === player
    );
    
    return assignment ? assignment.hudEntity : null;
  }

  /**
   * Gets all current HUD assignments (for debugging)
   */
  public getHudAssignments(): HudAssignment[] {
    return [...this.hudAssignments];
  }

  /**
   * Forces a refresh of all HUD assignments (if needed for troubleshooting)
   */
  public refreshAllAssignments(): void {
    
    const currentPlayers = this.world.getPlayers();
    
    // First, release all assignments
    this.hudAssignments.forEach(assignment => {
      if (assignment.assignedPlayer) {
        assignment.hudEntity.visible.set(false);
        assignment.assignedPlayer = null;
        assignment.isInUse = false;
      }
    });

    // Then reassign to current players
    currentPlayers.forEach(player => {
      this.assignHudToPlayer(player);
    });
    
  }

  /**
   * Debug method to log current HUD assignment state
   */
  public debugHudAssignments(): void {
    
  }

  /**
   * Gets the total number of available HUDs
   */
  public getAvailableHudCount(): number {
    return this.hudAssignments.filter(a => !a.isInUse).length;
  }

  /**
   * Gets the total number of HUDs
   */
  public getTotalHudCount(): number {
    return this.hudAssignments.length;
  }

  /**
   * Assigns an available HUD2 to a player
   */
  public assignHud2ToPlayer(player: hz.Player): boolean {
    const playerId = player.id.toString();
    
    // Check if player already has a HUD2 assigned
    const existingAssignment = this.hud2Assignments.find(
      assignment => assignment.assignedPlayer === player
    );

    if (existingAssignment) {
      // Ensure it's visible and owned by the player
      this.ensureHud2Ownership(existingAssignment, player);
      return true;
    }

    // Find an available HUD2
    const availableHud2 = this.hud2Assignments.find(
      assignment => !assignment.isInUse && assignment.assignedPlayer === null
    );

    if (availableHud2) {
      
      // Assign the HUD2 to the player
      availableHud2.assignedPlayer = player;
      availableHud2.isInUse = true;

      // Set ownership and make visible to the player
      this.ensureHud2Ownership(availableHud2, player);
      
      return true;
    } else {
      return false;
    }
  }

  /**
   * Ensures proper ownership and visibility of a HUD2 for a player
   */
  private ensureHud2Ownership(assignment: HudAssignment, player: hz.Player): void {
    try {
      // Set ownership to the specific player
      assignment.hudEntity.owner.set(player);
      
      // Make the HUD2 visible
      assignment.hudEntity.visible.set(true);
      
      
    } catch (error) {
    }
  }

  /**
   * Releases a player's HUD2 assignment
   */
  public releasePlayerHud2(player: hz.Player): void {
    const playerAssignment = this.hud2Assignments.find(
      assignment => assignment.assignedPlayer === player
    );

    if (playerAssignment) {
      
      try {
        // Hide the HUD2 entity
        playerAssignment.hudEntity.visible.set(false);

        // Mark as available
        playerAssignment.assignedPlayer = null;
        playerAssignment.isInUse = false;
        
        
      } catch (error) {
        // Still mark as available even if there was an error
        playerAssignment.assignedPlayer = null;
        playerAssignment.isInUse = false;
      }
    } else {
    }
  }

  /**
   * Gets the HUD2 entity assigned to a specific player
   */
  public getPlayerHud2(player: hz.Player): hz.Entity | null {
    const assignment = this.hud2Assignments.find(
      assignment => assignment.assignedPlayer === player
    );
    
    return assignment ? assignment.hudEntity : null;
  }

  /**
   * Gets all current HUD2 assignments (for debugging)
   */
  public getHud2Assignments(): HudAssignment[] {
    return [...this.hud2Assignments];
  }
}

// Register the component so it can be attached to entities
ui.UIComponent.register(HudManager);
