import { Component, OnInit } from '@angular/core';
import { HistoryHostService } from 'src/app/services/host/history-host.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SpotifyService } from 'src/app/services/spotify.service';
import { CategoryHostService } from 'src/app/services/host/category-host.service';
import { GameHostService } from 'src/app/services/host/game-host.service';
import { GameState } from 'src/app/models/state';
import { StateHostService } from 'src/app/services/host/state-host.service';
import { SafePropertyRead } from '@angular/compiler';
import { MatSnackBar } from '@angular/material';
import { switchMap, take } from 'rxjs/operators';


@Component({
  selector: 'app-end-screen',
  templateUrl: './end-screen.component.html',
  styleUrls: ['./end-screen.component.scss']
})
export class EndScreenComponent implements OnInit {

  playedTracks: SAPI.PlaylistTrackObject[];
  savedTracks: SAPI.PlaylistTrackObject[] = [];


  constructor(
    private history: HistoryHostService,
    private spotify: SpotifyService,
    private game: GameHostService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.playedTracks = this.history.playedTracks;
  }

  createPlaylist() {
    const tracks: string[] = this.savedTracks.map(track => track.track.uri);
    if (tracks.length > 0) {
      this.spotify.createPlaylist().pipe(
        switchMap(playlist => this.spotify.addToPlaylist(playlist.id, tracks)),
        take(1)
      ).subscribe(() => this.snackbar.open('Playlist created'));
    } else {
      this.snackbar.open('No tracks to add');
    }

  }
  playMore() {
    this.game.continue();
  }
  restartGame() {
    this.game.restart();
  }



  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
}