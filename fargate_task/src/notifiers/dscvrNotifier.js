export class DscvrNotifier {
  DSCVR_CHANNEL = "codegov";

  constructor(dscvrPostId, logs) {
    this.dscvrPostId = dscvrPostId;
    this.logs = logs;
  }

  async call() {
    // TODO

    return true;
  }
}
