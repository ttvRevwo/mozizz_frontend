from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import sys

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

try:
    driver.get("http://localhost:5173")
    driver.maximize_window()
    wait = WebDriverWait(driver, 10)

    try:
        login_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'BEJELENTKEZÉS') or contains(text(), 'Bejelentkezés')]")))
        login_btn.click()
    except Exception as e:
        print(f"Nem sikerült megnyitni a bejelentkezési ablakot: {e}")
        driver.quit()
        sys.exit()

    time.sleep(3) 
    
    try:
        inputs = wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "input")))
        inputs[0].send_keys("mozizz.hu@gmail.com")
        inputs[1].send_keys("M0zizzTeszt!")
        
        buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'BEJELENTKEZÉS') or contains(text(), 'Bejelentkezés')]")
        buttons[-1].click()
        time.sleep(4) 
        print("Sikeres bejelentkezés.")
    except Exception as e:
        print(f"Nem sikerült bejelentkezni: {e}")
        driver.quit()
        sys.exit()
    
    try:
        booking_buttons = wait.until(EC.presence_of_all_elements_located((
            By.XPATH, "//*[contains(text(), 'JEGYFOGLALÁS') or contains(text(), 'Jegyfoglalás')]"
        )))
        driver.execute_script("arguments[0].click();", booking_buttons[0])
        print("JEGYFOGLALÁS gomb sikeresen megnyomva.")
        time.sleep(3)
    except Exception as e:
        print(f"Nem sikerült megnyomni a jegyfoglalás gombot: {e}")
        driver.quit()
        sys.exit()

    try:
        seat_a15 = wait.until(EC.presence_of_element_located((By.XPATH, "//*[text()='A15']")))
        driver.execute_script("arguments[0].click();", seat_a15)
        print("A15-ös szék sikeresen kiválasztva.")
        time.sleep(2)
    except Exception as e:
        print(f"Nem sikerült kiválasztani az A15-ös széket: {e}")
        driver.quit()
        sys.exit()
    
    try:
        next_btn = driver.find_element(By.XPATH, "//*[contains(translate(text(), 'TOVÁBB', 'tovább'), 'tovább')]")
        driver.execute_script("arguments[0].click();", next_btn)
        print("Tovább gomb sikeresen megnyomva.")
        time.sleep(2)
    except Exception as e:
        # Itt nem léptetem ki a programot, mert elképzelhető, hogy egyből felugrik a fizetési ablak
        print(f"Nem sikerült megnyomni a Tovább gombot (lehetséges, hogy nincs ilyen gomb): {e}")

    try:
        paypal_btn = wait.until(EC.element_to_be_clickable((
            By.XPATH, "//button[contains(@class, 'pm-method-btn') and contains(., 'PayPal')]"
        )))
        driver.execute_script("arguments[0].click();", paypal_btn)
        print("PayPal sikeresen kiválasztva.")
        time.sleep(1)
    except Exception as e:
        print(f"Nem sikerült kiválasztani a PayPal opciót: {e}")
        driver.quit()
        sys.exit()

    try:
        final_pay_buttons = driver.find_elements(By.XPATH, "//button[contains(translate(text(), 'FIZETÉS', 'fizetés'), 'fizetés') or contains(translate(text(), 'VÁSÁRLÁS', 'vásárlás'), 'vásárlás') or contains(translate(text(), 'RENDELÉS', 'rendelés'), 'rendelés')]")
        if final_pay_buttons:
            driver.execute_script("arguments[0].click();", final_pay_buttons[-1])
            print("Fizetés gomb sikeresen megnyomva.")
        else:
            raise Exception("Nem található a fizetés gomb.")
        time.sleep(3)
    except Exception as e:
        print(f"Nem sikerült megnyomni a végső fizetés gombot: {e}")
        driver.quit()
        sys.exit()

    try:
        driver.save_screenshot("tests/login_booking_test_success.png")
        print("Teszt sikeres. Képernyőkép elmentve a tests mappába.")
    except Exception as e:
        print(f"Hiba a képernyőkép mentésekor: {e}")

finally:
    time.sleep(4) 
    driver.quit()