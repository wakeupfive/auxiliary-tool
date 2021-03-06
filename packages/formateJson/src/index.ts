export interface Options {
  target: string;
  oldKey: string[];
  newKey: string[];
}
export type DeepJson = {
  areaName: string;
  areaCode: string;
  parentAreaCode: string;
  headChar: string;
  areaLevel: string;
  childArea: DeepJson[];
};
export type DeepNewKeyJson = {
  [key: string]: DeepNewKeyJson[];
};


export default class FormateJson {
  static selfName = 'formateJson'
  /**
   * @description 树循环方法
   * @private
   * @param {DeepJson[]} json
   * @param {Function} callback
   * @param {DeepNewKeyJson[]} [result=[]]
   * @return {*}  {DeepNewKeyJson[]}
   * @memberof FormateJson
   */
  private deepJson(json: DeepJson[], callback: Function, result: DeepNewKeyJson[] = []): DeepNewKeyJson[] {
    if (!json.length) return []
    let len = json.length
    for (let i = 0; i < len; i++) {
      const item = json[i]
      let resultItem = callback(item)
      result.push(resultItem)
      if (item.childArea.length) {
        this.deepJson(item.childArea, callback, result)
      }
    }
    return result
  }

  /**
   * @description 同步树的每一项的改变
   * @private
   * @param {DeepJson} jsonItem
   * @param {string[]} oldKey
   * @param {string[]} newKey
   * @return {*}  {({ [key: string]: string | { key: string }[] })}
   * @memberof FormateJson
   */
  private synchronizeAttr(jsonItem: DeepJson, oldKey: string[], newKey: string[]): { [key: string]: string | { key: string }[] } {
    if (!jsonItem) {
      throw Error
    }
    const result: { [key: string]: string } = {}
    for (const key in jsonItem) {
      let item = jsonItem[key]
      let index = oldKey.findIndex(t => t === key)
      if (index === -1) {
        // result[key] = item
      } else {
        result[newKey[index]] = item
      }
    }
    return result
  }

  /**
   * @description 默认方法，返回指定格式的 树结构
   * @param {DeepJson[]} [json=[]]
   * @param {Options} [options={ target: 'addressTreePCD', oldKey: ['childArea', 'areaName', 'areaCode'], newKey: ['children', 'label', 'value'] }]
   * @return {*}  {DeepNewKeyJson[]}
   * @memberof FormateJson
   */
  public init(json: DeepJson[] = [], options: Options = { target: 'addressTreePCD', oldKey: ['childArea', 'areaName', 'areaCode'], newKey: ['children', 'label', 'value'] }): DeepNewKeyJson[] {
    if (!Array.isArray(json)) {
      throw Error('json is not array')
    }
    const { target, oldKey, newKey } = options
    const alias: string = target.charAt(0).toUpperCase() + target.slice(1)
    console.time()
    let result = this[`handle${alias}`](json, oldKey, newKey)
    console.timeEnd()
    return result
  }

  /**
   * @description 指定格式，返回树结构
   * @param {DeepJson[]} json
   * @param {string[]} oldKey
   * @param {string[]} newKey
   * @param {Function} [customized=() => { }]
   * @return {*}  {DeepNewKeyJson[]}
   * @memberof FormateJson
   */
  public handleAddressTreePCD(json: DeepJson[], oldKey: string[], newKey: string[], customized: Function = () => { }): DeepNewKeyJson[] {
    if (!Array.isArray(json)) {
      throw Error('json is not array')
    }
    if (oldKey.length !== newKey.length) {
      console.log('旧的key 不等于 新的key')
      process.exit(0)
    }
    let result = this.deepJson(json, (item: DeepJson) => {
      let result = this.synchronizeAttr(item, oldKey, newKey)
      return result
    })
    return result
  }
}