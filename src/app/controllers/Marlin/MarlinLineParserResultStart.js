class MarlinLineParserResultStart {
  // start
  static parse(line) {
    const r = line.match(/^start$/);
    if (!r) {
      return null;
    }

    const payload = {};

    return {
      type: MarlinLineParserResultStart,
      payload,
    };
  }
}

export default MarlinLineParserResultStart;
