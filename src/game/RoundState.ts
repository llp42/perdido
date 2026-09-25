export class RoundState {
  private round = 1;

  get current(): number {
    return this.round;
  }

  advance(): number {
    this.round += 1;
    return this.round;
  }
}
