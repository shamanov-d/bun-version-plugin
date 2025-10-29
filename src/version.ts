export class PrefixValidationException extends Error {
  constructor(prefix: string) {
    super();
    this.message = `Префикс имеет неверный синтаксис: ${prefix}`;
  }
}
export class VersionValidationException extends Error {
  constructor(prefix: string) {
    super();
    this.message = `Версия имеет неверный синтаксис: ${prefix}`;
  }
}
export class SetValidateException extends Error {
  constructor(val: string) {
    super();
    this.message = `Присваиваемое  значение ${val} не соответствует ни версии ни префиксу`;
  }
}

export class Version {
  public year!: number;
  public quarter!: number;
  public sprint!: number;
  public prefix!: string;

  constructor(ver?: string | Version) {
    if (ver instanceof Version) {
      this.setVersion(ver);
    } else if (typeof ver === "string") {
      const [version, prefix] = ver.split("-") as [string, string];
      if (Version.versionValid(version))
        throw new VersionValidationException(version);
      if (typeof prefix === "string" && Version.prefixValid(prefix))
        throw new PrefixValidationException(prefix);
      this.setVersionStr(version);
      this.prefix = prefix;
    } else {
      this.next();
    }
  }

  private setVersionStr(ver: string) {
    const [year, quarter, sprint] = ver.split(".");
    this.year = Number(year);
    this.quarter = Number(quarter);
    this.sprint = Number(sprint);
  }

  private setVersion({ year, quarter, sprint, prefix }: Version) {
    this.year = year;
    this.quarter = quarter;
    this.sprint = sprint;
    this.prefix = prefix;
  }

  /**
   * следующая версия
   */
  public next(today = new Date()) {
    const newYear = today.getFullYear();
    const newQuarter = Math.floor((today.getMonth() + 3) / 3);
    if (newQuarter !== this.quarter || newYear !== this.year) {
      this.sprint = 1;
    } else this.sprint++;
    this.quarter = newQuarter;
    this.year = newYear;
    this.prefix = "";
    return this;
  }

  public set(verOrPrefix?: string | Version) {
    const verOrPrefixStr = verOrPrefix as string;
    if (!verOrPrefix) {
      this.next();
    } else if (verOrPrefix instanceof Version) {
      this.setVersion(verOrPrefix);
    } else if (!Version.versionValid(verOrPrefixStr)) {
      this.setVersionStr(verOrPrefixStr);
    } else if (!Version.prefixValid(verOrPrefixStr)) {
      this.prefix = verOrPrefixStr;
    } else throw new SetValidateException(verOrPrefixStr);
    return this;
  }

  /**
   * сравнивает больше ли ли переданная версия текущей
   *
   * у префиксов нет порядка
   * разница по префиксам говорит переданная версия больше
   * если префикса у новой версии нет а у старой есть новая меньше
   * @param val
   */
  public compare({ year, quarter, sprint, prefix }: Version) {
    if (year > this.year) return true;
    if (year === this.year && quarter > this.quarter) return true;
    if (year === this.year && quarter === this.quarter && sprint > this.sprint)
      return true;
    if (
      prefix &&
      year === this.year &&
      quarter === this.quarter &&
      sprint === this.sprint &&
      this.prefix !== prefix
    )
      return true;
    return false;
  }

  /**
   * префикс допускает символы алфавита и буквы любом порядке любой длины
   * спецсимволы запрещены
   */
  static prefixValid(prefix: string) {
    const ret = prefix.match(/([A-z]|[0-9]){1,}/i);
    if (!ret) return true;
    if (ret[0] !== prefix) return true;
    return false;
  }

  static versionValid(ver?: string) {
    const ret = ver?.match(/[0-9]{4}\.[1-4]{1}\.[0-9]{1,4}/i);
    if (!ret) return true;
    if (ret[0] !== ver) return true;
    return false;
  }

  toString() {
    if (this.prefix) {
      return `${this.year}.${this.quarter}.${this.sprint}-${this.prefix}`;
    } else {
      return `${this.year}.${this.quarter}.${this.sprint}`;
    }
  }
}
