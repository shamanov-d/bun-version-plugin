import {
  PrefixValidationException,
  SetValidateException,
  Version,
  VersionValidationException,
} from "./version";
import { describe, expect, it } from "bun:test";

describe("Version", () => {
  const version = {
    valid: ["1992.1.1", "1992.2.1231", "4533.3.1231", "2014.4.32"],
    invalid: [
      "2.4.32", //год мимо
      "1235.0.32", //квартал мимо
      "1235.1.32543", //спринт мимо
      "",
    ],
  };
  const prefix = {
    valid: [
      "prefix",
      "prefix132",
      "123prefix",
      "123prefix132",
      "pre123fix",
      "123",
      "Ue123EWE",
    ],
    invalid: ["-213", "123//asd", "123/*", "12%3", ""],
  };
  const verAndPrefix = {
    valid: version.valid.reduce<string[]>((acc, ver) => {
      // валидное с валидным
      return [...acc, ...prefix.valid.map((prefix) => ver + "-" + prefix)];
    }, []),
    invalid: [
      ...version.valid.reduce<string[]>((acc, ver) => {
        // валидные версии с невалидным префиксом
        return [...acc, ...prefix.invalid.map((prefix) => ver + "-" + prefix)];
      }, []),
      // ...version.invalid.reduce<string[]>((acc, ver) => {
      //   // невалидные версии с невалидным префиксом
      //   return [...acc, ...prefix.invalid.map(prefix => ver + "-" + prefix)];
      // }, []),
      // ...version.invalid.reduce<string[]>((acc, ver) => {
      //   // невалидные версии с валидным префиксом
      //   return [...acc, ...prefix.valid.map(prefix => ver + "-" + prefix)];
      // }, [])
    ],
  };
  it("prefix validation", () => {
    prefix.valid.forEach((ver) => expect(Version.prefixValid(ver)).toBeFalsy());
    prefix.invalid.forEach((ver) =>
      expect(Version.prefixValid(ver)).toBeTruthy()
    );
  });
  it("version validation", () => {
    version.valid.forEach((ver) =>
      expect(Version.versionValid(ver)).toBeFalsy()
    );
    version.invalid.forEach((ver) =>
      expect(Version.versionValid(ver)).toBeTruthy()
    );
  });
  it("new validation", () => {
    expect(new Version(new Version("1234.2.2")).toString()).toEqual("1234.2.2");
    version.valid.forEach((ver) =>
      expect(new Version(ver)).toBeInstanceOf(Version)
    );
    version.invalid.forEach((ver) =>
      expect(() => new Version(ver)).toThrow(VersionValidationException)
    );

    verAndPrefix.valid.forEach((ver) =>
      expect(new Version(ver)).toBeInstanceOf(Version)
    );
    verAndPrefix.invalid.forEach((ver) =>
      expect(() => new Version(ver)).toThrow(PrefixValidationException)
    );
  });
  it("toString", () => {
    expect(new Version("1234.2.1").toString()).toEqual("1234.2.1");
    expect(new Version("1234.2.1-prefix").toString()).toEqual(
      "1234.2.1-prefix"
    );
  });
  it("next", () => {
    const date = new Date("Thu Oct 21 2021 12:16:57 GMT+0300");
    expect(new Version("1234.4.1").next(date).toString()).toEqual("2021.4.1"); //обновился год
    expect(new Version("2021.3.1").next(date).toString()).toEqual("2021.4.1"); //обновился квартал
    expect(new Version("2021.4.1").next(date).toString()).toEqual("2021.4.2"); //обновился спринт
    //при обновлении года или квартал счтчик спринта сбрасывается
    expect(new Version("2000.4.23").next(date).toString()).toEqual("2021.4.1");
    expect(new Version("2021.2.23").next(date).toString()).toEqual("2021.4.1");
    expect(new Version("2021.2.23-testPrefix").next(date).toString()).toEqual(
      "2021.4.1"
    );
  });
  it("set", () => {
    const ver = new Version();
    const sprint = ver.sprint;
    ver.set();
    expect(ver.sprint).toEqual(sprint + 1);

    expect(new Version().set(new Version("2021.2.23")).toString()).toEqual(
      "2021.2.23"
    );
    expect(new Version("2021.2.23").set("2021.2.22").toString()).toEqual(
      "2021.2.22"
    );
    expect(new Version("2021.2.23").set("pr").toString()).toEqual(
      "2021.2.23-pr"
    );
    expect(() => new Version("2021.2.23").set("%%").toString()).toThrow(
      SetValidateException
    );
  });

  it("compare", () => {
    expect(
      new Version("2021.2.23").compare(new Version("2021.2.23"))
    ).toBeFalsy();
    expect(
      new Version("2021.2.23").compare(new Version("2021.2.24"))
    ).toBeTruthy();
    expect(
      new Version("2021.2.23").compare(new Version("2021.3.23"))
    ).toBeTruthy();
    expect(
      new Version("2021.2.23").compare(new Version("2022.4.23"))
    ).toBeTruthy();
    expect(
      new Version("2021.2.23").compare(new Version("2021.2.23-pr"))
    ).toBeTruthy();
    expect(
      new Version("2021.2.23-pt").compare(new Version("2021.2.23"))
    ).toBeFalsy();
  });
});
