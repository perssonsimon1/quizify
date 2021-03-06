import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
/**
 * Component showing as a dialog allowing the player to input gamecode and chosen playername to join a game
 * @author Simon Persson, Oskar Norinder
 */
@Component({
  selector: 'app-join-dialog',
  templateUrl: './join-dialog.component.html',
  styleUrls: ['./join-dialog.component.scss']
})
export class JoinDialogComponent implements OnInit {

  form: FormGroup;
  code: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<JoinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data);
    if (this.data) {
      this.code = this.data;

    } else {
      this.code = '';
    }
  }

  ngOnInit() {

    this.form = this.fb.group({
      name: ['', Validators.required],
      gameCode: [this.code, Validators.required],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  /**
   * outputs the saved options input in the dialog
   */
  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
