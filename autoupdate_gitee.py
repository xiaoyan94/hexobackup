#!/usr/bin/python
# -*- coding: utf-8 -*-
import time
from selenium import webdriver
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.common.action_chains import ActionChains

driver_path = "chromedriver"

chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument("user-agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'")
driver = webdriver.Chrome(options=chrome_options,executable_path=driver_path)

# 模拟浏览器打开到gitee登录界面

# driver = webdriver.Chrome(driver_path)
driver.get('https://gitee.com/login')
# 将窗口最大化
driver.maximize_window()
time.sleep(2)

# 输入账号--通过html的id属性定位输入位置--改为你的账号
user_login = driver.find_element_by_id('user_login')
user_login.send_keys("ruguo_0904@163.com")
# 输入密码--通过html的id属性定位输入位置--改为你的密码
driver.find_element_by_id('user_password').send_keys("ywmgitee0904")
# 点击登录按钮--通过xpath确定点击位置
# ele = driver.find_element_by_xpath(
#    '/html/body/div[2]/div[2]/div[1]/div/div[2]/div/form[1]/div[2]/div/div/div[4]/input') #.click()
ele = driver.find_element_by_xpath(
    '//input[@value="登 录" and @name="commit"]')
print(ele.get_property("value"))
print(ele.get_attribute("value"))
ele.click()
time.sleep(5)

# 切换到gitee pages界面--改为you_gitee_id
driver.get('https://gitee.com/xy94/xy94/pages')
# 点击更新按钮--通过xpath确定点击位置 
text=driver.find_element_by_xpath('//*[@id="pages-branch"]/div[7]') #.click()
print(text.text)
time.sleep(5)

try:
    text.click()
    time.sleep(2)
    # 确认更新提示框--这个函数的作用是确认提示框
    Alert(driver).accept()
except Exception as e:
    print(e)
    text=driver.find_element_by_xpath('//*[@id="pages-branch"]/div[7]') 
    ActionChains(driver).move_to_element(text).click().perform()
    pass

# # 等待5秒更新
time.sleep(5)

# 这个print其实没事什么用,如果真的要测试脚本是否运行成功，可以用try来抛出异常
print("成功")

# 脚本运行成功,退出浏览器
driver.quit()

# 写上更新日志
# 我这里是写在D盘，可以改为自己喜欢的目录
# fp = open("~/log.txt", "a+")
# now_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
# fp.write("auto update time:{0}\n".format(now_time))
# fp.close()