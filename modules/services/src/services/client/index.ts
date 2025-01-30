import { HydraSDK } from "@hydraprotocol/sdk";
import { Observable, ReplaySubject, shareReplay } from "rxjs";

export class ClientService {
  private client$?: Observable<HydraSDK>;
  private clientSubject$ = new ReplaySubject<HydraSDK>(1);

  get client(): Observable<HydraSDK> {
    if (!this.client$) {
      this.client$ = this.clientSubject$.asObservable().pipe(shareReplay(1));
    }
    return this.client$;
  }

  setClient(client: HydraSDK) {
    this.clientSubject$.next(client);
  }

  static new() {
    return new ClientService();
  }

  private static _instance: ClientService;
  static instance() {
    if (!this._instance) {
      this._instance = ClientService.new();
    }
    return this._instance;
  }
}
