const fontLinks = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
`
const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party"

const defaultStyles = `
* {
  padding: 0;
  margin: 0;
  font-family: Roboto, monospace;
  outline: none;
  font-weight: 500;
  box-sizing: border-box;
}
.container {
  max-width: 800px;
  margin: 0 auto;
}
`

const inputWrapperStyles = `
.input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.label {
  text-align: center;
  margin: 10px 0;
  color: #222;
  font-size: 20px;
  padding: 0 10px;
}
.input {
  background: white;
  border: 3px solid hsl(0, 0%, 20%);
  color: #222;
  width: calc(100% - 20px);
  padding: 3px 5px;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 700;
  transition: 0.3s all linear;
  margin-bottom: 10px;
}
hr {
  width: calc(100% - 20px);
  margin: 0 auto;
}
`
const infoStyles = `
h3, h4 {
  text-align: center;
  color: #222;
}
h3 {
  margin: 16px 0 8px;
  font-size: 22px;
}
h4 {
  font-size: 18px;
}  
h4.property {
  color: #333;
  margin-bottom: 10px;
  max-width: calc(100% - 20px);
  margin: 0 auto 10px;
}
.loader {
  width: 100px;
  height: 100px;
  background: conic-gradient(white, greenyellow, white, greenyellow, white, greenyellow, white);
  border-radius: 50%;
  margin: 100px auto 0;
  animation: loading 2s linear infinite;
}  
@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`
const dropDownListStyles = `
.drop-down-list {
  width: calc(100% - 20px);
  overflow-y: scroll;
  margin: 5px auto 0;
}
.list-item {
  width: 100%;
  border: 1px solid #333;
  color: #38414e;
  border-radius: 2px;
  text-align: center;
  padding: 5px;
  transition: background 0.4s;
  margin-top: 1px;
  cursor: pointer;
}
.list-item:hover {
  background: #f0fff3;
  transition: background 0.4s;
}
`

const styles = [
  defaultStyles,
  inputWrapperStyles,
  infoStyles,
  dropDownListStyles
]


class DadataWidget extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'})
    const root = this.shadowRoot
    root.innerHTML = `
      <style></style>
      <div class="container">
        <div class="input-wrapper">
          <label class="label">Введите значение для поиска(ИНН или наименование)</label>
          <input type="text" class="input">
        </div>
        <hr>
        <div class="info">
          <h3>Информация пока не загружена</h3>
        </div>
      </div>
    `
    this.fontsAndStylesLoader()

    const input =  root.querySelector('.input')
    const info = root.querySelector('.info')

    
    input.addEventListener('keyup', (event) => {
      if (event.keyCode !== 13) return 
      info.innerHTML = `<div class="loader"></div>`
      fetch(url, this.getFetchOptions(input.value))
        .then(response => response.json())
        .then(result => {
          switch (result.suggestions.length) {
            case 0:
              info.innerHTML = `<h3>Совпадения по запросу не найдены</h3>`
              setTimeout(() => info.innerHTML = `<h3>Информация пока не загружена</h3>`, 3000)
            break;
            case 1:
              this.showInfo(result.suggestions[0])
            break;
            default: this.createDropDownList(result.suggestions)
          }
        })
      })
  }

  fontsAndStylesLoader() {
    document.head.insertAdjacentHTML('beforeend', fontLinks)
    const styleTag = this.shadowRoot.querySelector('style')
    styles.forEach(style => styleTag.insertAdjacentHTML('beforeend', style))
  }
  
  getFetchOptions(query) {
    return {
      method: "POST",
      mode: "cors",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Token " + "1b497aef682e24f8caf4e51a9577d94e81dd7ccc"
      },
      body: JSON.stringify({query})
    }
  }
  
  
  showInfo(result) {
    this.shadowRoot.querySelector('.info').innerHTML = `
      <h3>Информация о компании</h3>
      <h4>Краткое наименование</h4>
      <h4 class="property">${result.value}</h4>
      <h4>Полное наименование</h4>
      <h4 class="property">${result.data.name.full_with_opf}</h4>
      <h4>ИНН/КПП</h4>
      <h4 class="property">
        ${result.data.inn}<br />
        ${result.data.kpp}
      </h4>
      <h4>Адрес</h4>
      <h4 class="property">${result.data.address.value}</h4>
    `
  }

  createDropDownList(resultsArray) {
    this.shadowRoot.querySelector('.info').innerHTML = `<div class="drop-down-list"></div>`
    const dropDownList = this.shadowRoot.querySelector('.drop-down-list')
    resultsArray.forEach(el => {
      const newItem = document.createElement('div')
      newItem.innerHTML = el.data.name.full_with_opf
      newItem.classList.add('list-item')
      dropDownList.append(newItem)
      newItem.onclick = () => this.showInfo(el)
    })
  }
}

customElements.define("dadata-widget", DadataWidget);




function createDropDownList(result) {
  document.querySelector('.info').innerHTML = `<div class="drop-down-list"></div>`
  const dropDownList = document.querySelector('.drop-down-list')
  result.forEach(el => {
    const newItem = document.createElement('div')
    newItem.innerHTML = el.data.name.full_with_opf
    newItem.classList.add('list-item')
    dropDownList.append(newItem)
    newItem.onclick = () => showInfo(el)
  })
}

// window.addEventListener('DOMContentLoaded', () => {
//   const input =  document.querySelector('.input')
//   const select =  document.querySelector('.select')
//   const error = document.querySelector('.error')
//   const info = document.querySelector('.info')

//   const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";

//   input.addEventListener('keyup', (event) => {
//     if (event.keyCode !== 13) return
    
//     document.querySelector('.info').innerHTML = `<div class="loader"></div>`
//     fetch(url, getFetchOptions(input.value))
//       .then(response => response.json())
//       .then(result => {
//         switch (result.suggestions.length) {
//           case 0:
//             info.innerHTML = `<h3>Информация по запросу не найдена</h3>`
//             setTimeout(() => info.innerHTML = `<h3>Информация пока не загружена</h3>`, 3000)
//           break;
//           case 1:
//             showInfo(result.suggestions[0])
//           break;
//           default: createDropDownList(result.suggestions)
//         }
//       })

//   })
// })