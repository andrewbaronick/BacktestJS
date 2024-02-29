export async function initializeChart(url, containerId, legendId, withTitle, ordersUrl = null) {
  const candleStickData = await fetchJSON(url)

  if (withTitle) {
    const symbolData = await fetchJSON('http://localhost:8000/candleName.json')
    const symbolName = symbolData.name.replace("-", " ")
    document.getElementById("chartHeader").innerText = `${symbolName} Candles`
  }

  const chart = LightweightCharts.createChart(
    document.getElementById(containerId),
    {
      timeScale: {
        borderColor: 'white',
      },
      priceScale: {
        borderColor: 'white',
      },
      layout: {
        background: { color: "#11002E" },
        textColor: "white",
      },
      grid: {
        vertLines: { color: "rgba(130, 120, 170, 0.3)" },
        horzLines: { color: "rgba(130, 120, 170, 0.3)" },
      },
    }
  )

  chart.timeScale().applyOptions({
    borderColor: '#8278AA',
    timeVisible: true,
    secondsVisible: false,
    tickMarkFormatter: (time, tickMarkType, locale) => {
      const date = new Date(time)
      const options = { month: 'short', day: '2-digit', year: 'numeric' }
      return date.toLocaleDateString(undefined, options)
    },
  })

  chart.timeScale().fitContent()

  const mainSeries = chart.addCandlestickSeries({
    priceLineVisible: false
  });


  mainSeries.setData(candleStickData)

  if (ordersUrl) {
    const ordersData = await fetchJSON(ordersUrl)
    let markersData = ordersData.map(order => {
      let color = ""
      let position = ""
      let shape = ""

      if (order.type === "buy") {
        position = "aboveBar"
        shape = "arrowUp"
      } else {
        position = "belowBar"
        shape = "arrowDown"
      }

      color = order.position === "long" ? "#36D9D9" : "#39B3D8"

      return {
        time: order.time,
        color: color,
        position: position,
        shape: shape,
        text: `${order.type} / ${order.position}`
      }
    })
    mainSeries.setMarkers(markersData)
  }

  const legend = document.getElementById(legendId)

  chart.subscribeCrosshairMove((param) => {
    if (!param.time || param.point.x < 0 || param.point.y < 0) {
      legend.innerText = ''
    } else {
      const seriesData = Array.from(param.seriesData.values())
      if (seriesData.length > 0) {
        const ohlc = seriesData[0]
        if (ohlc) {
          legend.innerText =
            ' O: ' + round(ohlc.open) +
            ' H: ' + round(ohlc.high) +
            ' L: ' + round(ohlc.low) +
            ' C: ' + round(ohlc.close)
          legend.style.color = '#9B7DFF'
        }
      }
    }
  })

  chart.applyOptions({
    localization: {
      priceFormatter: p => p.toFixed(4),
      timeFormatter: function (unixTime) {
        const date = new Date(unixTime)
        const options = { month: 'short', day: '2-digit', year: 'numeric' }
        return date.toLocaleDateString(undefined, options)
      }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: {
        width: 8,
        color: "#9B7DFF44",
        style: LightweightCharts.LineStyle.Solid,
        labelBackgroundColor: "#9B7DFF",
      },
      horzLine: {
        color: "#9B7DFF",
        labelBackgroundColor: "#9B7DFF",
      },
    },
  })


  mainSeries.applyOptions({
    wickUpColor: "#3CD39C",
    upColor: "#3CD39C",
    wickDownColor: "#D63A66",
    downColor: "#D63A66",
    borderVisible: false
  })


  mainSeries.priceScale().applyOptions({
    borderColor: "#8278AA",
    autoScale: true
  })

  window.addEventListener("resize", () => {
    chart.resize(window.innerWidth, window.innerHeight)
  })
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url)
    return response.json()
  } catch (error) {
    console.log('Error fetching JSON file:', error)
    return null
  }
}

function round(numberToConvert) {
  if (Math.abs(numberToConvert) >= 1) {
    return numberToConvert.toFixed(2);
  }

  else {
    let strNum = numberToConvert.toFixed(20)
    let i = 0;

    while (strNum[i + 2] === '0') {
      i++;
    }

    let rounded = parseFloat(strNum.slice(0, i + 2 + 3 + 1))

    let strRounded = rounded.toString();
    strRounded = strRounded.slice(0, i + 2 + 3)

    return Number(strRounded);
  }
}

let sortOrder = {
  endAmountUpdated: 'asc',
  sharpeRatioUpdated: 'asc',
  maxDrawdown: 'asc'
};

export async function populateTable(url, tableId, key = null) {
  const response = await fetchJSON(url)
  let data

  if (key) {
    data = response[key]
  } else {
    data = response
  }

  if (tableId === 'orders-table') {
    const hasNonZeroBorrowedBaseAmount = data.some(order => order.borrowedBaseAmount !== 0)

    if (!hasNonZeroBorrowedBaseAmount) {
      data = data.map(({ borrowedBaseAmount, ...rest }) => rest)
    }

    if (key === 'assetAmountsPercentages') {
      const generalData = response.generalData
      if (generalData[4].length !== 0) {
        const table = document.getElementById(tableId);

        // Directly preceding <h2> selection
        let h2 = table.previousElementSibling;
        if (h2.tagName === 'H2') {
          h2.style.display = 'none'
        }
        table.style.display = 'none'
      }
    }

    data = data.map(order => {
      let newOrder = {
        ...order,
        time: new Date(order.time).toLocaleString(),
        baseAmount: round(order.baseAmount)
      }

      if (order.borrowedBaseAmount) {
        newOrder.borrowedBaseAmount = round(order.borrowedBaseAmount)
      }

      return newOrder
    })
  }

  if (!data.length) {
    console.log('No data to populate in the table.');
    return;
  }

  const table = document.getElementById(tableId)
  const headers = Object.keys(data[0])

  let row = table.tHead.insertRow()
  for (let header of headers) {
    let cell = row.insertCell()
    cell.outerHTML = `<th>${toTitleCase(header.replace(/([A-Z])/g, ' $1'))}</th>`
  }

  const tbody = table.tBodies[0]
  for (let item of data) {
    row = tbody.insertRow()
    for (let header of headers) {
      let cell = row.insertCell()
      cell.textContent = item[header]
    }
  }
}
function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export async function populateHeatmap(sortedData = null) {
  // Data Preparation for Heatmap
  const resultsMulti = sortedData ? sortedData : await fetchJSON('http://localhost:8000/results-unsorted-multi.json');
  let z = resultsMulti.map(d => d.endAmount);
  let hoverText = resultsMulti.map(d => {
    // Create a new object without the specified keys
    const { maxDrawdownAmount, numberOfCandlesInvested, assetAmounts, ...newObject } = d;

    // Convert the new object to a string
    return Object.entries(newObject).map(([key, value]) => `${key}: ${value}`).join(', ');
  });

  // Plotly Heatmap (Add zmin and zmax)
  const trace = {
    z: [z],
    type: 'heatmap',
    hoverinfo: 'text',
    text: [hoverText],
    colorscale: [
      [0, '#D63A66'],
      [1, '#3CD39C']
    ],
    zmin: resultsMulti[resultsMulti.length - 1].endAmount,
    zmax: resultsMulti[0].endAmount,
    showscale: true
  };

  const layout = {
    xaxis: { showticklabels: false },
    yaxis: { showticklabels: false },
    font: {
      family: 'Montserrat, sans-serif', // Specify the font family here
      size: 13, // You can adjust the size as needed
      color: 'white' // Set the title color
    },
    plot_bgcolor: "#19043B", 
    paper_bgcolor: "#11002E"
  };

  Plotly.newPlot('heatmap', [trace], layout);
}

export async function sortTable(key) {
  const tableId = 'permutation-table';
  const url = 'http://localhost:8000/results-multi.json';
  const data = await fetchJSON(url);

  if (!data || !data.multiResults) return;

  const sortedData = [...data.multiResults].sort(compareValues(key, sortOrder[key]));
  sortOrder[key] = sortOrder[key] === 'asc' ? 'desc' : 'asc'; // Toggle sort order for next click

  populateTableWithData(tableId, sortedData);
}

function populateTableWithData(tableId, data) {
  const table = document.getElementById(tableId);
  const tBody = table.tBodies[0];
  tBody.innerHTML = ''; // Clear existing rows

  // Populate table rows with sorted data
  data.forEach(item => {
    const row = tBody.insertRow();
    Object.values(item).forEach(text => {
      const cell = row.insertCell();
      cell.textContent = text;
    });
  });
}

function parsePercentageValue(value) {
  return parseFloat(value.split('%')[0]);
}

function compareValues(key, order = 'asc') {
  return function innerSort(a, b) {
    const varA = (key === 'endAmountUpdated' || key === 'maxDrawdown') ? parsePercentageValue(a[key]) : a[key];
    const varB = (key === 'endAmountUpdated' || key === 'maxDrawdown') ? parsePercentageValue(b[key]) : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

export async function createHeatmapSortButtons() {
  const data = await fetchJSON('http://localhost:8000/results-unsorted-multi.json');
  if (!data || !data.length) return;

  const firstItem = data[0];
  const keys = Object.keys(firstItem);
  const symbolIndex = keys.indexOf('symbol');
  if (symbolIndex === -1) return; // If 'symbol' is not found, exit

  const sortKeys = keys.slice(0, symbolIndex); // Get keys before 'symbol'
  const sortButtonsContainer = document.createElement('div');
  sortButtonsContainer.className = 'sort-buttons';

  sortKeys.forEach(key => {
    const button = document.createElement('button');
    button.className = 'sort-button';
    button.textContent = `Sort by ${key}`;
    button.onclick = () => sortHeatmap(key);
    sortButtonsContainer.appendChild(button);
  });

  const heatmapContainer = document.getElementById('heatmap');
  heatmapContainer.parentElement.insertBefore(sortButtonsContainer, heatmapContainer);
}

async function sortHeatmap(key) {
  const data = await fetchJSON('http://localhost:8000/results-unsorted-multi.json');
  if (!data) return;

  data.sort((a, b) => a[key] - b[key]);
  // Here, you would then repopulate or update the heatmap with the sorted data
  populateHeatmap(data); // Assume this function is modified to accept data as a parameter
}