export class Duration {

  public static seconds(amount: number): Duration {
    return new Duration(amount);
  }

  public static minutes(amount: number): Duration {
    return new Duration(amount * 60);
  }

  private readonly amount: number;

  private constructor(amount: number) {
    if (amount < 0) {
      throw new Error(`Duration amounts cannot be negative. Received: ${amount}`);
    }
    this.amount = amount;
  }

  public valueOfMilliseconds(): number {
    return this.amount * 1000;
  }
}