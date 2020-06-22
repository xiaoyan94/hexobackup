#!/bin/sh

tmp="public/baidusitemap0.xml"
bdxml="public/baidusitemap.xml"

if [ -f $tmp ]; then
rm $tmp
echo "Deleting tmp file."
fi

if [ ! -f $tmp ]; then
touch $tmp
echo "Create tmp file."
fi

cat $bdxml | while read line
do
	echo "${line//xiaoyan94.github.io/xy94.gitee.io}" >> $tmp
done

echo "After replacement:"

while read line
do
	echo "${line}"
done < $tmp

rm $bdxml
mv $tmp $bdxml

echo "End replacement."
