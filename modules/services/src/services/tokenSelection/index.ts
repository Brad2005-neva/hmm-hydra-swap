export class TokenSelectionService {
  static instance: TokenSelectionService;

  private constructor(
    private tokenA: string = "",
    private tokenB: string = ""
  ) {}

  public static getInstance(): TokenSelectionService {
    if (!TokenSelectionService.instance)
      TokenSelectionService.instance = new TokenSelectionService();

    return TokenSelectionService.instance;
  }

  setTokenA(assetToken: string) {
    this.tokenA = assetToken;
  }

  getTokenA() {
    return this.tokenA;
  }

  setTokenB(assetToken: string) {
    this.tokenB = assetToken;
  }

  getTokenB() {
    return this.tokenB;
  }
}
