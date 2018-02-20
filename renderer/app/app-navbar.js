// On hover, display general-settings button color
const $generalSettings = $('#general-settings')
$generalSettings.on('mouseover', () => {
  document.getElementById('setting-icon').style.color = 'rgb(254, 57, 96)'
})
$generalSettings.on('mouseleave', () => {
  document.getElementById('setting-icon').style.color = 'rgba(254, 57, 96, 0.5)'
})

