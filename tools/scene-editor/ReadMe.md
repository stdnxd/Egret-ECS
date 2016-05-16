Scene-Editor
-----------
请先执行

```
npm install
```
若遇到无法下载electron-prebuilt所需的二进制包问题，请根据提示手动下载官网的镜像包并解压到dist下，新建dist/path.txt文件并设置electron入口的相对地址。

1.编辑器面板调试模式(不包含文件操作)

```
npm run debug
```
日常的界面和交互开发在此模式下完成，使用网页调试即可。

2.编辑器面板发布模式

```
npm run deploy
```
只有发布后才可以用app打开

3.使用app打开应用

```
npm start
```
具有完整的项目选择界面的app

4.打包app

```
npm run mac-bundle
```
将该app打包成能够分发的应用。