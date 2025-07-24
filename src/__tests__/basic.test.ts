/**
 * Basic Math Functions Test
 * Simple test to verify Jest setup is working correctly
 */

describe('Basic Math Functions', () => {
  it('should add two numbers correctly', () => {
    expect(2 + 2).toBe(4)
    expect(5 + 3).toBe(8)
  })

  it('should multiply two numbers correctly', () => {
    expect(3 * 4).toBe(12)
    expect(7 * 6).toBe(42)
  })

  it('should handle string concatenation', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World')
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr[0]).toBe(1)
    expect(arr.includes(2)).toBe(true)
  })

  it('should work with objects', () => {
    const obj = { name: 'Test', value: 42 }
    expect(obj.name).toBe('Test')
    expect(obj.value).toBe(42)
    expect(Object.keys(obj)).toEqual(['name', 'value'])
  })
})

describe('Game Logic Helpers', () => {
  // Improved helper function to handle accented characters
  function toImageName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  it('should convert card names to image filenames', () => {
    expect(toImageName('La Dama')).toBe('la-dama')
    expect(toImageName('El Corazón')).toBe('el-corazon')
    expect(toImageName('La Muerte')).toBe('la-muerte')
  })

  it('should handle special characters', () => {
    expect(toImageName('El Niño!')).toBe('el-nino')
    expect(toImageName('---La Rosa---')).toBe('la-rosa')
    expect(toImageName('Las... Flores')).toBe('las-flores')
  })
})

describe('Bingo Logic', () => {
  function checkRowWin(marks: boolean[][]): boolean {
    return marks.some(row => row.every(Boolean))
  }

  function checkColumnWin(marks: boolean[][]): boolean {
    for (let col = 0; col < 4; col++) {
      if (marks.every(row => row[col])) return true
    }
    return false
  }

  it('should detect row wins', () => {
    const rowWin = [
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ]
    expect(checkRowWin(rowWin)).toBe(true)

    const noWin = [
      [true, true, false, true],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ]
    expect(checkRowWin(noWin)).toBe(false)
  })

  it('should detect column wins', () => {
    const colWin = [
      [true, false, false, false],
      [true, false, false, false],
      [true, false, false, false],
      [true, false, false, false]
    ]
    expect(checkColumnWin(colWin)).toBe(true)

    const noWin = [
      [true, false, false, false],
      [false, false, false, false],
      [true, false, false, false],
      [true, false, false, false]
    ]
    expect(checkColumnWin(noWin)).toBe(false)
  })
})
