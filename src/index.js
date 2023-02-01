import customLeafletMap from './customLeafletMap'
import './index.scss'

let queue = []
let data = null

const settings = {
  map_individuals: el => {
    customLeafletMap(
      el,
      data.individuals,
      'vk_group',
      (d) => `
        ${d.full_unit_affiliation_english ? `<p>Unit affiliation: ${d.full_unit_affiliation_english}</p>` : ''}
        ${(d.city_title || d.country_title) ? `<p class="comma-list"><span>${d.city_title}</span><span>${d.country_title}</span></p>` : ''}
        ${d.sex ? `<p>Sex: ${d.sex}</p>` : ''}
        ${d.occupation_type ? `<p>Occupation type: ${d.occupation_type}</p>` : ''}
        ${d.personal_alcohol ? `<p>Personal alcohol: ${d.personal_alcohol}</p>` : ''}
        ${d.personal_political ? `<p>Personal political: ${d.personal_political}</p>` : ''}
        ${d.personal_religion ? `<p>Personal religion: ${d.personal_religion}</p>` : ''}
      `
    )
  },
  map_units: el => {
    customLeafletMap(
      el,
      data.units,
      'vk_group',
      (d) => `
        ${d.existence ? `<p><em>${d.existence}</em></p>` : ''}
        ${(d.full_unit_affiliation_english || d.full_unit_affiliation_russian)
          ? `<p>Unit affiliation: <span class="slash-list"><span>${d.full_unit_affiliation_english}</span><span>${d.full_unit_affiliation_russian}</span></span></p>`
          : ''}
        ${(d.location_english || d.location_russian)
          ? `<p>Location: <span class="slash-list"><span>${d.location_english}</span><span>${d.location_russian}</span></span></p>`
          : ''}
      `
    )
  }
}

fetch('https://na-data-sheetsstorm.s3.us-west-2.amazonaws.com/prod/ff/wagner-maps.json').then(response => response.json()).then((_data)=>{
  data = _data
  for(let i=0; i<queue.length; i++)
    queue[i]()
})

window.renderDataViz = function(el){
  let id = el.getAttribute('id')
  let chart = settings[id]
  if(!chart) return

  if(data){
    chart(el)
  } else {
    queue.push(() => chart(el))
  }
}
