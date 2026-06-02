let unit = 'metric';

function setUnit(u) {
  unit = u;
  document.getElementById('metricBtn').classList.toggle('active', u === 'metric');
  document.getElementById('imperialBtn').classList.toggle('active', u === 'imperial');
  document.getElementById('weightLabel').textContent = u === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
  document.getElementById('heightLabel').textContent = u === 'metric' ? 'Height (cm)' : 'Height (inches)';
  document.getElementById('weight').value = '';
  document.getElementById('height').value = '';
  document.getElementById('bmiValue').textContent = '--';
  document.getElementById('bmiCategory').textContent = 'Enter your details';
  document.getElementById('bmiIndicator').style.left = '0%';
}

function calculateBMI() {
  let weight = parseFloat(document.getElementById('weight').value);
  let height = parseFloat(document.getElementById('height').value);

  if (!weight || !height || weight <= 0 || height <= 0) {
    alert('Please enter valid weight and height!');
    return;
  }

  let bmi;
  if (unit === 'metric') {
    const heightM = height / 100;
    bmi = weight / (heightM * heightM);
  } else {
    bmi = (703 * weight) / (height * height);
  }

  bmi = parseFloat(bmi.toFixed(1));
  document.getElementById('bmiValue').textContent = bmi;

  let category, color, position;
  if (bmi < 18.5) {
    category = 'Underweight'; color = '#3498db'; position = 10;
  } else if (bmi < 25) {
    category = 'Normal weight'; color = '#2ecc71'; position = 35;
  } else if (bmi < 30) {
    category = 'Overweight'; color = '#f39c12'; position = 65;
  } else {
    category = 'Obese'; color = '#e74c3c'; position = 88;
  }

  document.getElementById('bmiCategory').textContent = category;
  document.getElementById('bmiCategory').style.color = color;
  document.getElementById('bmiValue').style.color = color;
  document.getElementById('bmiIndicator').style.left = position + '%';
}