import { Injectable } from '@angular/core';
import { Game, GameMode, Player } from '../models/state';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, filter, takeUntil, share } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Takes care of the hosts state which is
 * observed by the players.
 */

@Injectable({
  providedIn: 'root'
})
export class GameHostService {

  gameCode$ = new BehaviorSubject<string>(null);
  state$: Observable<Game>;

  constructor(
    private db: AngularFireDatabase,
    private router: Router
  ) { }

  newGame(gameCode: string, gameMode: GameMode) {
    const game: Game = {
      gameMode: gameMode,
      state: 'WELCOME'
    };
    this.db.object('games/' + gameCode).set(game);
    this.gameCode$.next(gameCode);
    this.state$ = this.gameCode$
      .pipe(
        switchMap(code => this.db.object<Game>('games/' + code).valueChanges().pipe(share()))
      );
    this.welcomeHandler();
  }

  get players(): Observable<Player[]> {
    return this.state$.pipe(
      filter(state => state.players ? true : false),
      map(state => Object.values(state.players)),
    );
  }


  private welcomeHandler() {
    this.router.navigate(['display']);
    const playersSubscription = this.state$.pipe(
      filter(state => state.players ? true : false),
      map(state => Object.values(state.players)),
    ).subscribe(players => {
      if (players.length === 1) {
        this.setGameAdmin(players[0].uid);
      }
      console.log('Players', players);
    });
  }

  private setGameAdmin(uid: string) {
    this.gameCode$.subscribe(code => {
      this.db.object('games/' + code).update({
        admin: {
          playerUID: uid,
          ready: false
        }
      });
      console.log('Admin set', uid);
      this.activateReadyObserver();
    });
  }

  private activateReadyObserver() {
    this.state$.pipe(
      takeUntil(this.state$.pipe(filter(state => state.state !== 'WELCOME'))),
      filter(state => state.admin ? true : false),
      map(state => state.admin.ready),
      filter(ready => ready),
    ).subscribe(ready => {
      console.log('Admin is ready, starting game');
      this.startGame();
    });
  }

  private startGame() {

  }

}
