import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamePlayerService } from 'src/app/services/game-player.service';
import { Observable, combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { Game } from '../../models/state';
import { AuthService } from 'src/app/services/auth.service';
import { has } from 'lodash';
/**
 * Top component for the player in a game switching between different sub-components on different stages of the game
 * @author Simon Persson, Oskar Norinder
 */
@Component({
  selector: 'app-player-display',
  templateUrl: './player-display.component.html',
  styleUrls: ['./player-display.component.scss']
})
export class PlayerDisplayComponent implements OnInit {

  displayName$: Observable<string>;
  adminUID$: Observable<string>;
  state$: Observable<Game>;

  private retries = 0;

  isCategoryPicker$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private game: GamePlayerService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    if (this.retries < 2) {
      if (has(this.game, 'state$')) {
        this.state$ = this.game.state$;
        this.displayName$ = this.game.displayName$;
        this.adminUID$ = this.state$.pipe(
          filter(state => state.admin ? true : false),
          map(state => state.admin.playerUID)
        );
        this.isCategoryPicker$ = this.game.isCategoryPicker$;
      } else {
        this.game.reconnect();
        this.retries += 1;
        this.init();
      }
    } else {
      console.error('Could not reconnect');
    }
  }
  /**
   * If the player is admin they can have sent a trigger to start the game and move on from welcome state
   */
  startGame() {
    this.game.startGame();
  }
  /**
   * If it's the players turn to pick a category they can select their option
   * @param option The category picked by the player 
   */
  selectCategory(option: string) {
    console.log('Category picked', option);
    this.game.pickCategory(option);
  }
    /**
   * Sends the given answers to the game service
   * @param evt Array holding the provided answers, artist's id, artist's name and the song's name
   */
  respond(evt: string[]) {
    this.game.respond(evt[0], evt[1], evt[2]);
  }
    /**
   * Gets only the values for the options for display them from an array
   * @param state The current game
   * @returns Array with the chosen options values
   */
  convertCategories(state: Game) {
    return Object.values(state.playerDisplay.category.options);
  }

}
